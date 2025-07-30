import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./sesClient.js";
import dotenv from "dotenv";
dotenv.config();

const createSendEmailCommand = (toAddresses, fromAddress) => {
  return new sendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [toAddresses],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: "<h1>This is the email body</h1>",
        },
        Text: {
          Charset: "UTF-8",
          Data: "This is the email body in text format",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Hello World From DevTinder",
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};

const run = async () => {
  const sendEmailCommand = createSendEmailCommand(
    "sagarhulle04@gmail.com",
    "sagarhulle04@gmail.com"
  );
  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      const messageRejectedError = caught;
      return messageRejectedError;
    }
    throw caught;
  }
};

module.exports = { run };
