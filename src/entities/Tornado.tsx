import React from 'react';
import type { Entity } from './types';
import { TILE_SIZE } from '../tiles/constants';
import { TileSpace } from './TileSpace';
import { ANY_OBJECT_SET, ANY_SPRITE_GRAPHIC_SET } from './constants';
import { parseSimpleSprite } from './util';

const dotPositions: Point[] = [
	{ x: 2, y: 1 },
	{ x: 40, y: 3 },
	{ x: 22, y: 15 },
	{ x: 4, y: 35 },
	{ x: 16, y: 60 },
	{ x: 20, y: 80 },
	{ x: 18, y: 94 },
	{ x: 21, y: 104 },
];

const Tornado: Entity = {
	paletteCategory: 'enemy',
	paletteInfo: {
		title: 'Tornado',
	},

	objectSets: ANY_OBJECT_SET,
	spriteGraphicSets: ANY_SPRITE_GRAPHIC_SET,
	layer: 'actor',
	editorType: 'entity',
	dimensions: 'none',
	objectId: 0x5d,

	resource: {
		romOffset: 0x189ac0,
		palettes: [
			[
				0x7f96,
				0x7fff,
				0x2528,
				0x10a6,
				0x1909,
				0x254b,
				0x2d8d,
				0x35cf,
				0x3e11,
				0x294a,
				0x35ad,
				0x4210,
				0x4e73,
				0x4299,
				0x46db,
				0x4f1d,
			],
		],
		tiles: [[163]],
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
		};

		const dotStyle = {
			width: TILE_SIZE / 2,
			height: TILE_SIZE / 2,
		};

		const scale = size / (TILE_SIZE * 7);

		return (
			<div
				className="relative bg-yellow-700 rounded-lg overflow-hidden"
				style={style}
			>
				{dotPositions.map((p, i) => (
					<div
						key={i}
						className="absolute bg-cover Tornado-bg"
						style={{
							...dotStyle,
							top: p.y * scale,
							left: size / 4 + p.x * scale,
						}}
					/>
				))}
			</div>
		);
	},

	render() {
		const style = {
			width: 3 * TILE_SIZE,
			height: 7 * TILE_SIZE,
		};

		const dotStyle = {
			width: TILE_SIZE / 2,
			height: TILE_SIZE / 2,
		};

		const tileSpaceStyle = {
			width: TILE_SIZE,
			height: TILE_SIZE,
		};

		return (
			<div className="relative" style={style}>
				{dotPositions.map((p, i) => (
					<div
						key={i}
						className="absolute bg-cover Tornado-bg"
						style={{ ...dotStyle, top: p.y, left: p.x }}
					/>
				))}
				<div className="absolute top-0 left-0" style={tileSpaceStyle}>
					<TileSpace />
				</div>
			</div>
		);
	},
};

export { Tornado };
