"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appleHealth = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
/**
 * @function
 * @param {functions.https.Request} request
 * @param {functions.Response<any>} response
 * @returns {void}
 */
exports.appleHealth = functions
    .region("asia-southeast1")
    .https.onRequest(async (request, response) => {
    // eslint-disable-next-line object-curly-spacing
    const { data } = request.body;
    console.log("Data which was from the Request Body:", JSON.stringify(data));
    const batch = db.batch();
    const collection = db.collection("apple-health");
    data.forEach((sample) => {
        const sampleDocumentData = createSampleDocumentData(sample);
        batch.set(collection.doc(), sampleDocumentData, {});
        console.log("This is the sample: ", JSON.stringify(sample));
    });
    await batch.commit();
    response.send("ok");
});
/**
 * @param {Sample} sample
 * @return {SampleDocumentData}
 */
function createSampleDocumentData(sample) {
    return Object.assign(Object.assign({}, sample), { date: admin.firestore.Timestamp.fromDate(new Date(sample.date)) });
}
//# sourceMappingURL=index.js.map