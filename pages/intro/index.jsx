import Image from 'next/image'
import { Inter } from 'next/font/google'
import { SubscriptionClient } from "graphql-subscriptions-client";

// get ready
const GRAPHQL_ENDPOINT = "ws://localhost:3000/api/graphql";

const query = `subscription  {
  clock
}`;

// set up the client, which can be reused
const client = new SubscriptionClient(GRAPHQL_ENDPOINT, {
  reconnect: true,
  lazy: true, // only connect when there is a query
  connectionCallback: (error) => {
    error && console.error(error);
  },
});

// make the actual request
// client.request({ query });

// the above doesn't do much though

// call subscription.unsubscribe() later to clean up
const subscription = client
  .request({ query })
  // so lets actually do something with the response
  .subscribe({
    next({ data }) {
      if (data) {
        console.log("We got something!", data);
      }
    },
  });

export default function Home() {
  return (
   <></>
  )
}








