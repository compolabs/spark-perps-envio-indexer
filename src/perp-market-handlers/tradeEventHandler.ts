import { PerpMarket, TradeEvent } from "generated";
import { getISOTime } from "../utils";
import { getHash } from "../utils";
import { nanoid } from "nanoid";

// Define a handler for the CancelOrderEvent within a specific market
PerpMarket.TradeEvent.handlerWithLoader({
	// Loader function to pre-fetch the user and order details for the specified market
	loader: async ({ event, context }) => {
		return {};
	},


	// Handler function that processes the order cancellation event and updates the order and balance data
	handler: async ({ event, context, loaderReturn }) => {
		// Construct the cancelOrderEvent object and save in context for tracking
		const tradeEvent: TradeEvent = {
			id: nanoid(),
			sellOrderId: event.params.sell_order_id,
			buyOrderId: event.params.buy_order_id,

			tradeSize: event.params.trade_size,
			tradePrice: event.params.trade_price,

			seller: event.params.seller.payload.bits,
			buyer: event.params.buyer.payload.bits,

			// timestamp: event.params.timestamp,
			txId: event.transaction.id,
			contractTimestamp: event.params.timestamp,
			timestamp: getISOTime(event.block.time),
		};
		context.TradeEvent.set(tradeEvent);
	},
});