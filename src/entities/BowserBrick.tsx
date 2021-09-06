import type { Entity } from './types';
import {
	encodeObjectSets,
	getBankParam1,
	parseCellObjectsParam1HeightParam2Width,
} from './util';
import { TILE_SIZE } from '../tiles/constants';
import React from 'react';
import { ANY_SPRITE_GRAPHIC_SET } from './constants';

const BowserBrick: Entity = {
	paletteCategory: 'terrain',
	paletteInfo: {
		subCategory: 'terrain-basic',
		title: 'Bowser Brick',
		description:
			'I named this Bowser brick because this is the only kind of brick he will smash through when he dive bombs',
	},

	objectSets: encodeObjectSets([[2, 2]]),
	spriteGraphicSets: ANY_SPRITE_GRAPHIC_SET,
	layer: 'stage',
	editorType: 'cell',
	dimensions: 'xy',
	objectId: 0x39,
	emptyBank: 1,
	param1: 'height',
	param2: 'width',

	resource: {
		palettes: [
			[
				0x7f96,
				0x7fff,
				0x0,
				0xda,
				0x159e,
				0x2a3f,
				0x3eff,
				0x1f4,
				0x29a,
				0x37f,
				0xb1,
				0x155,
				0x19d9,
				0x2e3d,
				0x3ebf,
				0x13,
			],
		],
		romOffset: 0x167674,
		tiles: [
			[20, 21],
			[22, 23],
		],
	},

	toObjectBinary({ x, y, w, h }): number[] {
		return [getBankParam1(1, h), y, x, this.objectId, w];
	},

	parseObject(data, offset) {
		return parseCellObjectsParam1HeightParam2Width(data, offset, this);
	},

	simpleRender(size) {
		return (
			<div
				className="BowserBrick-bg bg-cover"
				style={{ width: size, height: size }}
			/>
		);
	},

	render() {
		return this.simpleRender(TILE_SIZE);
	},
};

export { BowserBrick };
