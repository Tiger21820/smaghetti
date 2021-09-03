import React from 'react';
import { useSelector } from 'react-redux';

import { HexTreePage } from './HexTreePage';
import { AppState, dispatch } from '../../../store';
import { bindActionCreators } from 'redux';
import {
	loadLevel,
	loadEmptyLevel,
	loadFromLocalStorage,
	loadInGameLevel,
	resetLevel,
	toggleExclude,
	toggleExcludeAfter,
	patch,
	add,
	toFourBytes,
	toFiveBytes,
} from '../hexTreeSlice';
import { BinaryRoom, LevelTree, LevelTreeRoom } from '../types';
import { POINTER_AREA_SIZE_IN_BYTES } from '../../../levelData/constants';
import { getLevelName, setPointer } from '../../../levelData/createLevelData';

function parsedRoomToBinary(room: LevelTreeRoom): BinaryRoom {
	let objectExcludedAfter = false;
	const objects = room.objects.objects.reduce<number[]>((building, obj) => {
		if (objectExcludedAfter) {
			return building;
		}

		objectExcludedAfter = objectExcludedAfter || !!obj.excludedAfter;

		if (obj.exclude) {
			return building;
		} else {
			return building.concat(obj.rawBytes);
		}
	}, []);

	let spriteExcludedAfter = false;
	const sprites = room.sprites.sprites.reduce<number[]>((building, spr) => {
		if (spriteExcludedAfter) {
			return building;
		}

		spriteExcludedAfter = spriteExcludedAfter || !!spr.excludedAfter;

		if (spr.exclude) {
			return building;
		} else {
			return building.concat(spr.rawBytes);
		}
	}, []);

	let transportCount = 0;
	const transportData = room.transports.transports.reduce<number[]>(
		(building, tr) => {
			if (tr.exclude) {
				return building;
			} else {
				++transportCount;
				return building.concat(tr.rawBytes);
			}
		},
		[]
	);

	return {
		objectData: room.objects.header.rawBytes.concat(objects, [0xff]),
		levelSettingsData: room.levelSettings.rawBytes,
		transportData: [transportCount, 0].concat(transportData),
		spriteData: [0].concat(sprites, [0xff]),
		blockPathData: room.blockPaths.rawBytes,
		autoScrollData: room.autoScroll.rawBytes,
	};
}

function concatRoomData(room: BinaryRoom): number[] {
	return room.objectData.concat(
		room.levelSettingsData,
		room.transportData,
		room.spriteData,
		room.blockPathData,
		room.autoScrollData
	);
}

const EMPTY_ROOM: LevelTreeRoom = {
	objects: {
		header: {
			roomLength: 0,
			timeLimit: 0,
			rawBytes: [],
		},
		objects: [],
		pendingRawBytes: [],
	},
	sprites: {
		sprites: [],
		pendingRawBytes: [],
	},
	transports: {
		transports: [],
		rawBytes: [],
	},
	autoScroll: {
		rawBytes: [],
	},
	blockPaths: {
		rawBytes: [],
	},
	levelSettings: {
		settings: null,
		rawBytes: [],
	},
};

function parseTreeToData(parsed: LevelTree): Uint8Array {
	// header
	const header = parsed.header.rawBytes;

	// pointers
	const pointers: number[] = new Array(POINTER_AREA_SIZE_IN_BYTES);

	// empty bytes between pointers and name
	const nullBytes = new Array(11).fill(0);

	const name = getLevelName('hextree');

	const roomDatas: BinaryRoom[] = [];

	for (let i = 0; i < 4; ++i) {
		if (!parsed.rooms[i].exclude) {
			roomDatas.push(parsedRoomToBinary(parsed.rooms[i]));
		}
	}

	while (roomDatas.length < 4) {
		roomDatas.push(parsedRoomToBinary(EMPTY_ROOM));
	}

	const pointerOffset =
		header.length + pointers.length + nullBytes.length + name.length;

	//////////// POINTERS ////////////////

	///// ROOM0 //////////
	// objects
	let pointer = setPointer(pointers, 0, pointerOffset);
	// level settings
	pointer = setPointer(pointers, 1, pointer + roomDatas[0].objectData.length);
	// transport data
	pointer = setPointer(
		pointers,
		2,
		pointer + roomDatas[0].levelSettingsData.length
	);
	// sprite data
	pointer = setPointer(
		pointers,
		3,
		pointer + roomDatas[0].transportData.length
	);
	// block path movement data
	pointer = setPointer(pointers, 4, pointer + roomDatas[0].spriteData.length);
	// auto scroll movement data
	pointer = setPointer(
		pointers,
		5,
		pointer + roomDatas[0].blockPathData.length
	);

	///// ROOM1 //////////
	// objects
	pointer = setPointer(
		pointers,
		6,
		pointer + roomDatas[0].autoScrollData.length
	);
	// level settings
	pointer = setPointer(pointers, 7, pointer + roomDatas[1].objectData.length);
	// transport data
	pointer = setPointer(
		pointers,
		8,
		pointer + roomDatas[1].levelSettingsData.length
	);
	// sprite data
	pointer = setPointer(
		pointers,
		9,
		pointer + roomDatas[1].transportData.length
	);
	// block path movement data
	pointer = setPointer(pointers, 10, pointer + roomDatas[1].spriteData.length);
	// auto scroll movement data
	pointer = setPointer(
		pointers,
		11,
		pointer + roomDatas[1].blockPathData.length
	);

	///// ROOM2 //////////
	// objects
	pointer = setPointer(
		pointers,
		12,
		pointer + roomDatas[1].autoScrollData.length
	);
	// level settings
	pointer = setPointer(pointers, 13, pointer + roomDatas[2].objectData.length);
	// transport data
	pointer = setPointer(
		pointers,
		14,
		pointer + roomDatas[2].levelSettingsData.length
	);
	// sprite data
	pointer = setPointer(
		pointers,
		15,
		pointer + roomDatas[2].transportData.length
	);
	// block path movement data
	pointer = setPointer(pointers, 16, pointer + roomDatas[2].spriteData.length);
	// auto scroll movement data
	pointer = setPointer(
		pointers,
		17,
		pointer + roomDatas[2].blockPathData.length
	);

	///// ROOM2 //////////
	// objects
	pointer = setPointer(
		pointers,
		18,
		pointer + roomDatas[2].autoScrollData.length
	);
	// level settings
	pointer = setPointer(pointers, 19, pointer + roomDatas[3].objectData.length);
	// transport data
	pointer = setPointer(
		pointers,
		20,
		pointer + roomDatas[3].levelSettingsData.length
	);
	// sprite data
	pointer = setPointer(
		pointers,
		21,
		pointer + roomDatas[3].transportData.length
	);
	// block path movement data
	pointer = setPointer(pointers, 22, pointer + roomDatas[3].spriteData.length);
	// auto scroll movement data
	setPointer(pointers, 23, pointer + roomDatas[3].blockPathData.length);

	const fullData = header.concat(
		pointers,
		nullBytes,
		name,
		concatRoomData(roomDatas[0]),
		concatRoomData(roomDatas[1]),
		concatRoomData(roomDatas[2]),
		concatRoomData(roomDatas[3])
	);

	return new Uint8Array(fullData);
}

const actions = bindActionCreators(
	{
		onLevelChosen: loadLevel,
		onStartEmpty: loadEmptyLevel,
		onReset: resetLevel,
		onStartFromLocalStorage: loadFromLocalStorage,
		onInGameLevelChosen: loadInGameLevel,
		onExcludeChange: toggleExclude,
		onExcludeAfter: toggleExcludeAfter,
		onPatch: patch,
		onAdd: add,
		onFourBytes: toFourBytes,
		onFiveBytes: toFiveBytes,
	},
	dispatch
);

function ConnectedHexTreePage() {
	const { allFilesReady } = useSelector((state: AppState) => state.fileLoader);
	const {
		mode,
		tree,
		originalData,
		originalLevelName,
		byteSizes,
	} = useSelector((state: AppState) => state.hexTree);

	const data = tree ? parseTreeToData(tree) : new Uint8Array();

	return (
		<HexTreePage
			allFilesReady={allFilesReady}
			mode={mode}
			levelName={originalLevelName}
			tree={tree}
			data={data}
			originalData={new Uint8Array(originalData ?? [])}
			byteSizes={byteSizes}
			{...actions}
		/>
	);
}

export { ConnectedHexTreePage };
