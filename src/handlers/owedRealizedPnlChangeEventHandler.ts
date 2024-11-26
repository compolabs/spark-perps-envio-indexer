import { Account, OwedRealizedPnlChangeEvent } from "generated";
import { getISOTime } from "../utils";
import { getHash } from "../utils";
import { nanoid } from "nanoid";

// Define a handler for the CancelOrderEvent within a specific market
Account.OwedRealizedPnlChangeEvent.handlerWithLoader({
	// Loader function to pre-fetch the user and order details for the specified market
	loader: async ({ event, context }) => {
		return {};
	},


	// Handler function that processes the order cancellation event and updates the order and balance data
	handler: async ({ event, context, loaderReturn }) => {
		// Construct the cancelOrderEvent object and save in context for tracking
		const owedRealizedPnlChangeEvent: OwedRealizedPnlChangeEvent = {
			id: nanoid(),
			trader: event.params.trader.payload.bits,
			owedRealizedPnl: event.params.owed_realized_pnl.underlying,
			timestamp: getISOTime(event.block.time),
			txId: event.transaction.id
		};
		context.OwedRealizedPnlChangeEvent.set(owedRealizedPnlChangeEvent);
	},
});