'use strict';

import Promise from 'bluebird';
import config from 'config';
import AWS from 'aws-sdk';
import uuid from 'node-uuid';

AWS.config.update({
	accessKeyId: config.get( 'aws.key' ),
	secretAccessKey: config.get( 'aws.secret' )
});

var s3 = new AWS.S3();
Promise.promisifyAll(Object.getPrototypeOf(s3));

export default {

	/**
	 * Uploads file to S3. Returns Promise with file url
	 * @param {FileInfo} fileInfo
	 * @returns {Promise}
     */
	uploadFile(fileInfo) {
		return s3.uploadAsync({
			Bucket: config.get( 'aws.s3.bucket' ),
			Key: uuid.v4() + fileInfo.originalname,
			Body: fileInfo.buffer,
			ACL: 'public-read'
		})
			.then((data) => {
				return data.Location;
			});
	}
};
