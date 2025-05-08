
import { MongoClient, ServerApiVersion } from 'mongodb';
//const uri = "mongodb+srv://diguwasofts:kc5mFkUMs6fR3Kou@clusterdiguwasoft.knjtgcy.mongodb.net/myfayda?retryWrites=true&w=majority&appName=ClusterDiguwaSoft";

const uri = "mongodb://diguwasofts:kc5mFkUMs6fR3Kou@ac-cynby9u-shard-00-00.knjtgcy.mongodb.net:27017,ac-cynby9u-shard-00-01.knjtgcy.mongodb.net:27017,ac-cynby9u-shard-00-02.knjtgcy.mongodb.net:27017/myfayda?ssl=true&replicaSet=atlas-x2e0fx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ClusterDiguwaSoft"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
