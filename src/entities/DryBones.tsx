import type { Entity } from './types';
import { TILE_SIZE } from '../tiles/constants';
import { TileSpace } from './TileSpace';
import React from 'react';
import { ANY_OBJECT_SET } from './constants';
import { parseSimpleSprite } from './util';

/**
 * not compatible with any existing room types :(
 */
const DryBones: Entity = {
	paletteCategory: 'enemy',
	paletteInfo: {
		subCategory: 'enemy-fortress',
		title: 'Dry Bones',
	},

	objectSets: ANY_OBJECT_SET,
	spriteGraphicSets: [-1, -1, -1, 1, -1, -1],
	layer: 'actor',
	editorType: 'entity',
	dimensions: 'none',
	objectId: 0x3f,

	resource: {
		palettes: [
			[
				0x7f96,
				0x7fff,
				0x18c6,
				0x39ce,
				0x4a52,
				0x5ef7,
				0x7a8b,
				0x7f6e,
				0x7fd6,
				0x6f7b,
				0x19f8,
				0x2e5c,
				0x42ff,
				0x1b1f,
				0x1a1f,
				0x1d,
			],
		],
		romOffset: 0x167674,
		tiles: [
			[192, 193],
			[208, 209],
			[194, 195],
			[210, 211],
		],
	},

	toSpriteBinary({ x, y }) {
		return [0, this.objectId, x, y];
	},

	parseSprite(data, offset) {
		return parseSimpleSprite(data, offset, 0, this);
	},

	simpleRender(size) {
		const style = {
			width: size,
			height: size,
			backgroundSize: '50% 100%',
		};

		return <div className="DryBones-bg bg-center bg-no-repeat" style={style} />;
	},

	render() {
		const style = {
			width: TILE_SIZE,
			height: TILE_SIZE * 2,
			marginTop: -TILE_SIZE,
			paddingTop: TILE_SIZE,
			backgroundPositionY: 2,
		};

		return (
			<div className="DryBones-bg bg-cover bg-no-repeat" style={style}>
				<TileSpace />
			</div>
		);
	},
};

export { DryBones };
