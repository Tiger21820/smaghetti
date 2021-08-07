import type { Entity } from '../types';
import { encodeObjectSets, getBankParam1 } from '../util';
import { TILE_SIZE } from '../../tiles/constants';
import React from 'react';
import { TileSpace } from '../TileSpace';
import { ANY_SPRITE_GRAPHIC_SET } from '../constants';
import { objectSets } from './objectSets';

const LogBridge: Entity = {
	paletteCategory: 'terrain',
	paletteInfo: {
		subCategory: 'terrain-basic',
		title: 'Log Bridge',
	},

	objectSets: encodeObjectSets(objectSets),
	spriteGraphicSets: ANY_SPRITE_GRAPHIC_SET,
	layer: 'stage',
	editorType: 'cell',
	dimensions: 'x',
	objectId: 0x21,
	emptyBank: 1,
	param1: 'width',

	resource: {
		palettes: [
			[
				0x7f96,
				0x7fff,
				0x0,
				0x520c,
				0x6270,
				0x72f3,
				0x7b77,
				0x1f4,
				0x29a,
				0x37f,
				0x7e93,
				0x7f17,
				0x7fbc,
				0x7ffe,
				0x1df,
				0x31f,
			],
		],
		romOffset: 0x16ea40,
		tiles: [
			[982, 982],
			[983, 983],
		],
	},

	toObjectBinary({ x, y, w }) {
		return [getBankParam1(1, w), y, x, this.objectId];
	},

	simpleRender(size) {
		return (
			<div
				className="LogBridge-bg bg-cover"
				style={{ width: size, height: size }}
			/>
		);
	},

	render() {
		const style = {
			marginTop: TILE_SIZE / 2,
			width: TILE_SIZE,
			height: TILE_SIZE * 1.5,
			backgroundPositionY: TILE_SIZE / 2,
			paddingBottom: TILE_SIZE / 2,
		};

		return (
			<div className="LogBridge-bg bg-no-repeat" style={style}>
				<div className="w-full h-full" style={{ marginTop: -TILE_SIZE / 2 }}>
					<TileSpace />
				</div>
			</div>
		);
	},
};

export { LogBridge };
