const genericHeader = [
	0x00,
	0x30,
	0x01,
	0x02,
	0x00,
	0x01,
	0x08,
	0x10,
	0x00,
	0x00,
	0x10,
	0x12,
	0xf0, // card type, game data
	0x71, // region, US
	0x01,
	0x00,
	0x00, // TODO: 2 byte card identifier (from address 0x72, 0x73) reversed and multiplied by 4
	0x00, // TODO: 2 byte card identifier (from address 0x72, 0x73) reversed and multiplied by 4
	0x10,
	0x00, // TODO: global checksum 1
	0x00, // TODO: global checksum 1
	0x19,
	0x00,
	0x00,
	0x00,
	0x08,
	'N'.charCodeAt(0),
	'I'.charCodeAt(0),
	'N'.charCodeAt(0),
	'T'.charCodeAt(0),
	'E'.charCodeAt(0),
	'N'.charCodeAt(0),
	'D'.charCodeAt(0),
	'O'.charCodeAt(0),
	0x00,
	0x22,
	0x00,
	0x09,
	0x22, // number of cards: 1, card number: 1
	0x00, // TODO: data length times 2 and in reverse order
	0x00, // TODO: data length times 2 and in reverse order
	0x02,
	0x00, // application type: GBA
	0x00,
	0x00,
	0x00,
	0x00, // TODO: header checksum
	0x00, // TOOD: global checksum 2
	'S'.charCodeAt(0),
	'u'.charCodeAt(0),
	'p'.charCodeAt(0),
	'e'.charCodeAt(0),
	'r'.charCodeAt(0),
	' '.charCodeAt(0),
	'M'.charCodeAt(0),
	'a'.charCodeAt(0),
	'r'.charCodeAt(0),
	'i'.charCodeAt(0),
	'o'.charCodeAt(0),
	' '.charCodeAt(0),
	'A'.charCodeAt(0),
	'd'.charCodeAt(0),
	'v'.charCodeAt(0),
	'a'.charCodeAt(0),
	'n'.charCodeAt(0),
	'c'.charCodeAt(0),
	'e'.charCodeAt(0),
	' '.charCodeAt(0),
	'4'.charCodeAt(0),
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	'S'.charCodeAt(0),
	'u'.charCodeAt(0),
	'p'.charCodeAt(0),
	'e'.charCodeAt(0),
	'r'.charCodeAt(0),
	' '.charCodeAt(0),
	'M'.charCodeAt(0),
	'a'.charCodeAt(0),
	'r'.charCodeAt(0),
	'i'.charCodeAt(0),
	'o'.charCodeAt(0),
	' '.charCodeAt(0),
	'A'.charCodeAt(0),
	'd'.charCodeAt(0),
	'v'.charCodeAt(0),
	'a'.charCodeAt(0),
	'n'.charCodeAt(0),
	'c'.charCodeAt(0),
	'e'.charCodeAt(0),
	' '.charCodeAt(0),
	'4'.charCodeAt(0),
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x00,
	0x01, // set number
	0x00, // set type, 0 for levels
	0xff,
	0xff,
	0xff,
	0xff,
	0xff,
	0x00,
];

function fillRemainingData(cardData: number[]): number[] {
	if (cardData.length > 2112) {
		throw new Error('fillRemainingData: cardData too large');
	}

	// the junk bytes are
	// "These are just the current address subtracted by 0x70, and mod 0x100 (their values range between 0x00 to 0xFF)
	// For example, the junk byte at address 0x83F is always 0xCF"

	while (cardData.length !== 2112) {
		const byte = (cardData.length - 0x70) % 0x100;
		cardData.push(byte);
	}

	return cardData;
}

function setCardIdentifier(cardData: number[]): number[] {
	// 0x10 0x11: ** **
	// ** **: 2-byte card identifier (from addresses 0x72 and 0x73) reversed and multiplied by 4
	cardData[0x10] = cardData[0x73] * 4;
	cardData[0x11] = cardData[0x72] * 4;

	return cardData;
}

function setLevelLength(cardData: number[], levelDataSize: number): number[] {
	// 0x27 0x28: ** **
	//  ** **: data length times 2 and in reverse order
	//  (For level cards, the data length starts at address 0x72,
	//   and ends at the 0x00 terminating byte that follows the end of the .LCMP file)

	// the level data includes the set number, set type, and other misc stuff in front of the level data
	// + 1 is for the trailing null terminator
	const fullLevelDataSize = levelDataSize + 8 + 1;

	const fullDataLengthDoubled = fullLevelDataSize * 2;

	cardData[0x27] = fullDataLengthDoubled & 0xff;
	cardData[0x28] = (fullDataLengthDoubled >> 8) & 0xff;

	return cardData;
}

function calcChecksums(cardData: number[]): number[] {
	// 	unsigned char header_map[0xC] = { 	// map header values from data to bindata
	// 	0x0D, 0x0C, 0x11, 0x10, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D
	// };

	const headerMap = [
		0x0d, 0x0c, 0x11, 0x10, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d,
	];

	const BIN_SIZE = 0x81c;
	const DATA_SIZE = 0x840;
	const binData = new Array(BIN_SIZE).fill(0);

	// for (i=0; i<0x0C; i++)
	// 	bindata[i] = data[header_map[i]];
	for (let i = 0; i < 0x0c; ++i) {
		binData[i] = cardData[headerMap[i]];
	}

	// for(i=0x0C,j=0x30;j<DATA_SIZE; i++,j++)
	// 	bindata[i] = data[j];
	for (let i = 0xc, j = 0x30; j < DATA_SIZE; ++i, ++j) {
		binData[i] = cardData[j];
	}

	// //Header checksum
	// for(i=0,j=0;i<12;i++)
	// 	j ^= bindata[i];
	// data[0x2E] = j;
	let headerCheckSum = 0;
	for (let i = 0; i < 12; ++i) {
		headerCheckSum ^= binData[i];
	}

	cardData[0x2e] = headerCheckSum;

	// global checksum 1
	let global1Checksum = 0;
	for (let i = 0xc; i < BIN_SIZE; ++i) {
		if ((i & 1) === 1) {
			global1Checksum += binData[i];
		} else {
			global1Checksum += binData[i] << 8;
		}
	}
	global1Checksum &= 0xffff;
	global1Checksum ^= 0xffff;

	cardData[0x12] = 0x10;
	cardData[0x13] = (global1Checksum & 0xff00) >> 8;
	cardData[0x14] = global1Checksum & 0xff;

	// global checksum 2
	let j = 0;
	for (let i = 0; i < 0x2f; i++) {
		j += cardData[i];
	}

	j &= 0xff;

	let global2 = 0;
	for (let i = 1; i < 0x2c; i++) {
		let global1 = 0;
		for (let k = 0; k < 0x30; k++) {
			global1 ^= binData[(i - 1) * 0x30 + k + 0x0c];
		}
		global2 += global1;
	}

	global2 += j;
	global2 &= 0xff;
	global2 ^= 0xff;
	cardData[0x2f] = global2;

	return cardData;
}

/**
 * Given a compressed .level, returns the full card data including the header
 * to form an e-Reader card. With the resulting data, form it into a raw using nedcmake
 * and load it into an e-Reader or print it.
 */
function createCardData(compressedLevelData: Uint8Array): Uint8Array {
	let cardData: number[] = [
		...genericHeader,
		...Array.from(compressedLevelData),
		0, // terminating byte for level data
	];

	cardData = fillRemainingData(cardData);
	cardData = setCardIdentifier(cardData);
	cardData = setLevelLength(cardData, compressedLevelData.byteLength);
	cardData = calcChecksums(cardData);

	if (cardData.length !== 2112) {
		throw new Error(
			'createCardData: resulting card data is not correct length'
		);
	}

	return Uint8Array.from(cardData);
}

export { createCardData };
