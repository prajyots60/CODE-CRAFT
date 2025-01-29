import { httpRouter } from "convex/server";
import {httpAction} from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import {api} from "./_generated/api";

const http = httpRouter();

http.route({
  path : "/clerk-webhook",
  method: "POST",

  handler : httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET not set");
    }


    // get the svix headers for verification
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      throw new Error("Missing svix headers");
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret); // set the webhook secret
    let evt : WebhookEvent; // declare the event type

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature
      }) as WebhookEvent;
    } catch (error) {
      console.log("Error verifying webhook: ", error);
      
      return new Response("Error verifying webhook", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      //save user to convex db
      const {id, email_addresses, first_name, last_name} = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""} `

      try {
        //save to db
        await ctx.runMutation(api.users.syncUser, {
          userId : id,
          email,
          name
        })

      } catch (error) {
        console.log("Error saving user: ", error);
        return new Response("Error saving user", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  })
})

export default http;