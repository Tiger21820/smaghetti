import { LevelAutoScrollEntry } from '../../levelData/parseAutoScrollEntriesFromLevelFile';
import { ParsedLevelSettings } from '../../levelData/parseLevelSettingsFromLevelFile';

type RoomIndex = 0 | 1 | 2 | 3;

type LevelTreeObject = {
	bank: number;
	id: number;
	x: number;
	y: number;
	param1: number;
	param2?: number;
	rawBytes: number[];
	isKnown: boolean;
	exclude?: boolean;
	excludedAfter?: boolean;
};

type LevelTreeSprite = {
	bank: number;
	id: number;
	x: number;
	y: number;
	rawBytes: number[];
	exclude?: boolean;
	excludedAfter?: boolean;
};

type LevelTreeTransport = {
	sx: number;
	sy: number;
	destRoom: number;
	dx: number;
	dy: number;
	cx: number;
	cy: number;
	exitType: number;
	rawBytes: number[];
	exclude?: boolean;
};

type LevelTreeObjectHeader = {
	timeLimit: number;
	roomLength: number;
	rawBytes: number[];
};

type LevelTreeRoom = {
	objects: {
		header: LevelTreeObjectHeader;
		objects: LevelTreeObject[];
		pendingRawBytes: number[];
	};
	levelSettings: {
		settings: ParsedLevelSettings | null;
		rawBytes: number[];
	};
	transports: {
		transports: LevelTreeTransport[];
		rawBytes: number[];
	};
	sprites: {
		sprites: LevelTreeSprite[];
		pendingRawBytes: number[];
	};
	blockPaths: {
		rawBytes: number[];
	};
	autoScroll: {
		rawBytes: number[];
		entries: LevelAutoScrollEntry[];
	};
	exclude?: boolean;
};

type LevelHeader = {
	eCoin: boolean;
	aceCoins: number;
	levelClass: number;
	levelNumber: number;
	levelIcon: number;
	levelName: string;
	rawBytes: number[];
};

type LevelRooms = [LevelTreeRoom, LevelTreeRoom, LevelTreeRoom, LevelTreeRoom];

type LevelTree = {
	header: LevelHeader;
	rooms: LevelRooms;
};

type BinaryRoom = {
	objectData: number[];
	levelSettingsData: number[];
	transportData: number[];
	spriteData: number[];
	blockPathData: number[];
	autoScrollData: number[];
};

type ObjectExclusion = {
	type: 'object';
	roomIndex: RoomIndex;
	entity: LevelTreeObject;
};

type SpriteExclusion = {
	type: 'sprite';
	roomIndex: RoomIndex;
	entity: LevelTreeSprite;
};

type TransportExclusion = {
	type: 'transport';
	roomIndex: RoomIndex;
	entity: LevelTreeTransport;
};

type RoomExclusion = {
	type: 'room';
	roomIndex: RoomIndex;
};

type Exclusion =
	| ObjectExclusion
	| SpriteExclusion
	| TransportExclusion
	| RoomExclusion;

type ExcludeAfter = {
	roomIndex: number;
	type: 'object' | 'sprite';
	index: number;
};

type LevelSettingsPatch = {
	type: 'level-settings';
	roomIndex: RoomIndex;
	offset: number;
	bytes: number[];
};

type SpritePatch = {
	type: 'sprite';
	roomIndex: RoomIndex;
	spriteIndex: number;
	offset: number;
	bytes: number[];
};

type ObjectPatch = {
	type: 'object';
	roomIndex: RoomIndex;
	objectIndex: number;
	offset: number;
	bytes: number[];
};

type ObjectHeaderPatch = {
	type: 'object-header';
	roomIndex: RoomIndex;
	offset: number;
	bytes: number[];
};

type TransportPatch = {
	type: 'transport';
	roomIndex: RoomIndex;
	transportIndex: number;
	offset: number;
	bytes: number[];
};

type AutoScrollEntryPatch = {
	type: 'autoScroll';
	roomIndex: RoomIndex;
	autoScrollEntryIndex: number;
	offset: number;
	bytes: number[];
};

type Patch =
	| LevelSettingsPatch
	| SpritePatch
	| ObjectPatch
	| ObjectHeaderPatch
	| TransportPatch
	| AutoScrollEntryPatch;

type Add = {
	type: 'sprite' | 'object' | 'transport';
	roomIndex: number;
	afterIndex: number;
	bytes: number[];
};

type ByteSizes = {
	object: {
		four: number[];
		five: number[];
	};
};

export type {
	ObjectPatch,
	SpritePatch,
	TransportPatch,
	AutoScrollEntryPatch,
	LevelSettingsPatch,
	Patch,
	Add,
	SpriteExclusion,
	ObjectExclusion,
	TransportExclusion,
	RoomExclusion,
	Exclusion,
	ExcludeAfter,
	RoomIndex,
	LevelTree,
	LevelRooms,
	LevelHeader,
	LevelTreeRoom,
	LevelTreeObject,
	LevelTreeObjectHeader,
	LevelTreeSprite,
	LevelTreeTransport,
	BinaryRoom,
	ByteSizes,
};
