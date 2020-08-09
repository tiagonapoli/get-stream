'use strict';
// Const stream = require('stream');
// const {promisify} = require('util');
const bufferStream = require('./buffer-stream');

// Const streamPipelinePromisified = promisify(stream.pipeline);

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

async function getStream(inputStream, options) {
	if (!inputStream) {
		throw new Error('Expected a stream');
	}

	options = {
		maxBuffer: Infinity,
		...options
	};

	const {maxBuffer} = options;

	const stream = bufferStream(options);

	try {
		for await (const chunk of inputStream) {
			stream.write(chunk);
			if (stream.getBufferedLength() > maxBuffer) {
				throw new MaxBufferError();
			}
		}
	} catch (error) {
		error.bufferedData = stream.getBufferedValue();
		throw error;
	}

	return stream.getBufferedValue();
}

module.exports = getStream;
// TODO: Remove this for the next major release
module.exports.default = getStream;
module.exports.buffer = (stream, options) => getStream(stream, {...options, encoding: 'buffer'});
module.exports.array = (stream, options) => getStream(stream, {...options, array: true});
module.exports.MaxBufferError = MaxBufferError;
