import React from 'react';
import { TILE_SIZE } from '../../../../tiles/constants';
import { LevelTreeObject } from '../../types';
import { ObjectIcon } from '../entityIcons';
import {
	getEntityDefFromId,
	getEntityDefFromPayloadId,
	getEntityType,
} from '../util';
import { Entity } from '../../../../entities/types';
import { EntityType } from '../../../../entities/entityMap';

type LevelObjectProps = {
	object: LevelTreeObject;
	scale: number;
	objectSet: number;
};

function determineHeight(
	obj: LevelTreeObject,
	entityDef: Entity | null
): number {
	if (entityDef?.param1 === 'height') {
		return obj.param1;
	}

	if (entityDef?.param2 === 'height' && typeof obj.param2 === 'number') {
		return obj.param2;
	}

	return 1;
}

function determineWidth(
	obj: LevelTreeObject,
	entityDef: Entity | null
): number {
	if (entityDef?.param1 === 'width') {
		return obj.param1;
	}

	if (entityDef?.param2 === 'width' && typeof obj.param2 === 'number') {
		return obj.param2;
	}

	return 1;
}

function getPayloadType(
	payloads: Partial<Record<EntityType, number>>,
	id: number
): EntityType | null {
	const foundEntry = Object.entries(payloads).find((p) => p[1] === id);

	return (foundEntry?.[0] as EntityType) ?? null;
}

function LevelObject({ object, scale, objectSet }: LevelObjectProps) {
	const entityDefViaId = getEntityDefFromId(object, objectSet);
	const entityDefViaPayload = entityDefViaId
		? null
		: getEntityDefFromPayloadId(object, objectSet);

	const entityDef = entityDefViaId ?? entityDefViaPayload;

	const entityType = entityDef ? getEntityType(entityDef) : undefined;

	const widthInTiles = determineWidth(object, entityDef);
	const heightInTiles = determineHeight(object, entityDef);

	const width = widthInTiles * TILE_SIZE * scale;
	const height = heightInTiles * TILE_SIZE * scale;

	const style = {
		width,
		height,
		backgroundSize: TILE_SIZE,
	};

	if (entityDef) {
		const payload =
			(entityDefViaPayload &&
				getPayloadType(entityDefViaPayload.payloadToObjectId!, object.id)) ||
			null;

		if (entityDef.editorType === 'entity') {
			return entityDef.render({
				showDetails: false,
				settings: { payload, width: widthInTiles, height: heightInTiles },
				onSettingsChange: () => {},
			});
		} else {
			const cells = [];

			for (let y = 0; y < heightInTiles; ++y) {
				for (let x = 0; x < widthInTiles; ++x) {
					cells.push(
						entityDef.render({
							showDetails: false,
							settings: { payload, width: widthInTiles, height: heightInTiles },
							onSettingsChange: () => {},
						})
					);
				}
			}

			return (
				<div
					className="grid"
					style={{
						gridTemplateColumns: `repeat(${widthInTiles}, ${TILE_SIZE}px)`,
						gridTemplateRows: `repeat(${heightInTiles}, ${TILE_SIZE}px)`,
					}}
				>
					{cells}
				</div>
			);
		}
	} else {
		return (
			<ObjectIcon
				className="cursor-pointer"
				entityType={entityType}
				style={style}
				isKnown={object.isKnown ? 'yes' : 'no'}
			/>
		);
	}
}

export { LevelObject };
