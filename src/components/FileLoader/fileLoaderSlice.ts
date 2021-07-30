import { createSlice, Action, PayloadAction } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
// @ts-ignore no types
import * as sha1 from 'js-sha1';
import { AppState } from '../../store';
import {
	setBios,
	setRom,
	setEmptySave,
	setSaveState,
	setExampleLevel,
} from './files';
import { getRom } from './files';
import { entityMap, EntityType } from '../../entities/entityMap';
import { extractResourcesToStylesheet } from '../../tiles/extractResourcesToStylesheet';
import { deserialize as deserializeSaveState } from '../../saveStates/serializer';
import { resourceMap } from '../../resources/resourceMap';
import { Resource } from '../../resources/types';
import { logError } from '../../reporting/logError';

type RomFileState =
	| 'not-chosen'
	| 'loading'
	| 'success'
	| 'checksum-error'
	| 'error';
type OtherFilesState = 'loading' | 'success' | 'error';

type ExtractionState = 'not-started' | 'extracting' | 'complete';

type FileLoaderState = {
	romFileState: RomFileState;
	biosFileState: OtherFilesState;
	emptySaveFileState: OtherFilesState;
	saveStateJsonState: OtherFilesState;
	exampleLevelState: OtherFilesState;

	otherFilesState: OtherFilesState;
	allFilesReady: boolean;
	overallExtractionState: ExtractionState;
	extractedGraphicsState: Partial<Record<EntityType, ExtractionState>>;
};

const SMA4_SHA = '532f3307021637474b6dd37da059ca360f612337';

const defaultInitialState: FileLoaderState = {
	romFileState: 'not-chosen',
	biosFileState: 'loading',
	emptySaveFileState: 'loading',
	saveStateJsonState: 'loading',
	exampleLevelState: 'loading',
	otherFilesState: 'loading',
	allFilesReady: false,
	overallExtractionState: 'not-started',
	extractedGraphicsState: {},
};

const initialState = defaultInitialState;

function settleState(state: FileLoaderState) {
	const states = [
		state.emptySaveFileState,
		state.biosFileState,
		state.saveStateJsonState,
		state.exampleLevelState,
	];

	if (states.some((s) => s === 'error')) {
		state.otherFilesState = 'error';
	} else if (states.some((s) => s === 'loading')) {
		state.otherFilesState = 'loading';
	} else {
		state.otherFilesState = 'success';
	}

	state.allFilesReady =
		state.otherFilesState === 'success' &&
		state.romFileState === 'success' &&
		state.overallExtractionState === 'complete';
}

const fileLoaderSlice = createSlice({
	name: 'fileLoader',
	initialState,
	reducers: {
		// reducers related to the base files
		biosState(state: FileLoaderState, action: PayloadAction<OtherFilesState>) {
			state.biosFileState = action.payload;
			settleState(state);
		},
		romState(state: FileLoaderState, action: PayloadAction<RomFileState>) {
			state.romFileState = action.payload;
			settleState(state);
		},
		emptySaveState(
			state: FileLoaderState,
			action: PayloadAction<OtherFilesState>
		) {
			state.emptySaveFileState = action.payload;
			settleState(state);
		},
		saveStateJsonState(
			state: FileLoaderState,
			action: PayloadAction<OtherFilesState>
		) {
			state.saveStateJsonState = action.payload;
			settleState(state);
		},
		exampleLevelState(
			state: FileLoaderState,
			action: PayloadAction<OtherFilesState>
		) {
			state.exampleLevelState = action.payload;
			settleState(state);
		},
		overallExtractionState(
			state: FileLoaderState,
			action: PayloadAction<ExtractionState>
		) {
			state.overallExtractionState = action.payload;
			settleState(state);
		},
		resourceExtractionState(
			state: FileLoaderState,
			action: PayloadAction<{
				type: EntityType;
				state: ExtractionState;
			}>
		) {
			const { type, state: extractionState } = action.payload;

			state.extractedGraphicsState[type] = extractionState;
		},
	},
});

type FileLoaderThunk = ThunkAction<void, AppState, null, Action>;

const loadRom = (file: File): FileLoaderThunk => async (dispatch) => {
	try {
		dispatch(fileLoaderSlice.actions.romState('loading'));

		const reader = new FileReader();
		reader.addEventListener('loadend', () => {
			const romFile = new Uint8Array(reader.result as ArrayBuffer);

			const sha = sha1(romFile);

			if (sha !== SMA4_SHA) {
				dispatch(fileLoaderSlice.actions.romState('checksum-error'));
			} else {
				setRom(romFile);
				dispatch(fileLoaderSlice.actions.romState('success'));
			}
		});

		reader.addEventListener('error', () => {
			dispatch(fileLoaderSlice.actions.romState('error'));
		});

		reader.readAsArrayBuffer(file);
	} catch (e) {
		dispatch(fileLoaderSlice.actions.romState('error'));
	}
};

const loadEmptySave = (): FileLoaderThunk => async (dispatch) => {
	try {
		dispatch(fileLoaderSlice.actions.emptySaveState('loading'));

		fetch('/empty.sav')
			.then((r) => r.blob())
			.then((blob) => {
				const reader = new FileReader();
				reader.addEventListener('loadend', () => {
					setEmptySave(new Uint8Array(reader.result as ArrayBuffer));
					dispatch(fileLoaderSlice.actions.emptySaveState('success'));
				});

				reader.addEventListener('error', (e) => {
					console.error('failed to load empty save', e);
					logError({
						context: 'fileLoaderSlice#loadEmptySave,error event listener',
						message: (e ?? 'no error object').toString(),
					});
					dispatch(fileLoaderSlice.actions.emptySaveState('error'));
				});

				reader.readAsArrayBuffer(blob);
			})
			.catch((e) => {
				console.error('failed to load empty save', e);
				logError({
					context: 'fileLoaderSlice#loadEmptySave,first catch',
					message: e?.message ?? 'no message',
					stack: e?.stack,
				});
				dispatch(fileLoaderSlice.actions.emptySaveState('error'));
			});
	} catch (e) {
		console.error('failed to load empty save', e);
		logError({
			context: 'fileLoaderSlice#loadEmptySave,second catch',
			message: e?.message ?? 'no message',
			stack: e?.stack,
		});
		dispatch(fileLoaderSlice.actions.emptySaveState('error'));
	}
};

const loadSaveState = (): FileLoaderThunk => async (dispatch) => {
	try {
		dispatch(fileLoaderSlice.actions.saveStateJsonState('loading'));

		fetch('/justOutsideEReaderMenu.json')
			.then((r) => r.text())
			.then((saveStateText) => {
				const saveState = deserializeSaveState(saveStateText);
				setSaveState(saveState);
				dispatch(fileLoaderSlice.actions.saveStateJsonState('success'));
			})
			.catch((e) => {
				console.error('failed to load save state json', e);
				dispatch(fileLoaderSlice.actions.saveStateJsonState('error'));
			});
	} catch (e) {
		console.error('failed to load save state json', e);
		logError({
			context: 'fileLoaderSlice#loadSaveState,catch',
			message: e?.message ?? 'no message',
			stack: e?.stack,
		});
		dispatch(fileLoaderSlice.actions.saveStateJsonState('error'));
	}
};

const loadExampleLevel = (): FileLoaderThunk => async (dispatch) => {
	try {
		dispatch(fileLoaderSlice.actions.exampleLevelState('loading'));

		fetch('/exampleLevel.json')
			.then((r) => r.text())
			.then((exampleLevelText) => {
				const serializedExampleLevel = JSON.parse(
					exampleLevelText
				) as SerializedLevel;
				setExampleLevel(serializedExampleLevel);
				dispatch(fileLoaderSlice.actions.exampleLevelState('success'));
			})
			.catch((e) => {
				console.error('failed to load example level', e);
				logError({
					context: 'fileLoaderSlice#loadExampleLevel,first catch',
					message: e?.message ?? 'no message',
					stack: e?.stack,
				});
				dispatch(fileLoaderSlice.actions.exampleLevelState('error'));
			});
	} catch (e) {
		console.error('failed to load example level', e);
		logError({
			context: 'fileLoaderSlice#loadExampleLevel,second catch',
			message: e?.message ?? 'no message',
			stack: e?.stack,
		});
		dispatch(fileLoaderSlice.actions.exampleLevelState('error'));
	}
};

const loadBios = (): FileLoaderThunk => async (dispatch) => {
	try {
		dispatch(fileLoaderSlice.actions.biosState('loading'));

		fetch('/bios.bin')
			.then((r) => r.blob())
			.then((blob) => {
				const reader = new FileReader();
				reader.addEventListener('loadend', () => {
					setBios(new Uint8Array(reader.result as ArrayBuffer));
					dispatch(fileLoaderSlice.actions.biosState('success'));
				});

				reader.addEventListener('error', (e) => {
					console.error('failed to load bios', e);
					logError({
						context: 'fileLoaderSlice#loadBios,error event listener',
						message: (e ?? 'no error object').toString(),
					});
					dispatch(fileLoaderSlice.actions.biosState('error'));
				});

				reader.readAsArrayBuffer(blob);
			})
			.catch((e) => {
				console.error('failed to load bios', e);
				logError({
					context: 'fileLoaderSlice#loadBios,first catch',
					message: e?.message ?? 'no message',
					stack: e?.stack,
				});
				dispatch(fileLoaderSlice.actions.biosState('error'));
			});
	} catch (e) {
		console.error('failed to load bios', e);
		logError({
			context: 'fileLoaderSlice#loadBios,second catch',
			message: e?.message ?? 'no message',
			stack: e?.stack,
		});
		dispatch(fileLoaderSlice.actions.biosState('error'));
	}
};

const extract = (): FileLoaderThunk => async (dispatch) => {
	const rom = getRom();

	if (!rom) {
		throw new Error('fileLoaderSlice#extract: called before rom is set');
	}

	dispatch(fileLoaderSlice.actions.overallExtractionState('extracting'));

	const entityResourceMap = Object.keys(entityMap).reduce<
		Partial<Record<string, Resource>>
	>((building, key) => {
		const entityDef = entityMap[key as EntityType];
		if (entityDef.resource) {
			building[key] = entityDef.resource;
		}

		if (entityDef.resources) {
			Object.keys(entityDef.resources).forEach((resourceKey) => {
				building[resourceKey] = entityDef.resources![resourceKey];
			});
		}

		return building;
	}, {});

	await extractResourcesToStylesheet(rom, {
		...entityResourceMap,
		...resourceMap,
	});

	dispatch(fileLoaderSlice.actions.overallExtractionState('complete'));
};

const reducer = fileLoaderSlice.reducer;

export type { FileLoaderState, OtherFilesState, ExtractionState };

export {
	reducer,
	loadBios,
	loadRom,
	loadEmptySave,
	loadSaveState,
	loadExampleLevel,
	extract,
};
