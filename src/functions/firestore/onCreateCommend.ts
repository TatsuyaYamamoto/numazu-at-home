import { firestore } from "firebase-admin";
import { EventContext } from "firebase-functions";

import { IGHashtagRecentMedia } from "../../share/models/IG";
import { CommandDocument } from "../../share/models/Command";
import { saveAlgoliaObjects } from "../helper/algolia";
import { createNewDocData } from "../helper/instagram";
import { mergeFirestoreDocs } from "../helper/firestore";

const onCreateCommend = async (
  snapshot: firestore.DocumentSnapshot,
  _: EventContext
): Promise<any> => {
  const newCommand = (await snapshot.ref.parent.parent?.get())?.data() as
    | CommandDocument
    | undefined;

  if (newCommand?.type === "LOAD_IG_HASHTAG_RECENT_MEDIA") {
    const igMedia = snapshot.data() as IGHashtagRecentMedia;

    const data = await createNewDocData(igMedia);
    if (!data) {
      console.error("creation of post doc is failed, end.");
      return;
    }

    const users = { [data.user.id]: data.user };
    const posts = { [data.post.id]: data.post };

    const firestoreResults = await mergeFirestoreDocs({ users, posts });
    console.log(
      `firestore commit is succeed. write result counts: ${firestoreResults.length}`
    );

    const algoliaResult = await saveAlgoliaObjects({ users, posts });
    console.log(
      `algolia object saving is succeed. objectIDs: ${algoliaResult.objectIDs}`
    );
  }
};

export default onCreateCommend;
