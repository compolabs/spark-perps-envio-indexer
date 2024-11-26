import { ClearingHouse, MarketEvent } from "generated";
import { getISOTime } from "../utils";
import { getHash } from "../utils";
import { nanoid } from "nanoid";

// Define a handler for the CancelOrderEvent within a specific market
ClearingHouse.MarketEvent.handlerWithLoader({
	// Loader function to pre-fetch the user and order details for the specified market
	loader: async ({ event, context }) => {
		return {};
	},


	// Handler function that processes the order cancellation event and updates the order and balance data
	handler: async ({ event, context, loaderReturn }) => {
		// Construct the cancelOrderEvent object and save in context for tracking
		const marketEvent: MarketEvent = {
			id: nanoid(),
			sender: event.params.sender.payload.bits,
			assetId: event.params.market.asset_id.bits,
			decimal: BigInt(event.params.market.decimal),
			priceFeed: event.params.market.price_feed,
			imRatio: event.params.market.im_ratio,
			mmRatio: event.params.market.mm_ratio,
			status: event.params.market.status.case,
			pausedIndexPrice: event.params.market.paused_index_price.case === "Some"
				? event.params.market.paused_index_price.payload
				: undefined,
			pausedTimestamp: event.params.market.paused_timestamp.case === "Some"
				? event.params.market.paused_timestamp.payload
				: undefined,
			closedPrice: event.params.market.closed_price.case === "Some"	
				? event.params.market.closed_price.payload
				: undefined,

			identifier: event.params.identifier.case,
			timestamp: event.params.timestamp,
			txId: event.transaction.id
		};
		context.MarketEvent.set(marketEvent);
	},
});