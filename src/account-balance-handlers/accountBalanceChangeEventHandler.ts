import { AccountBalance, AccountBalanceChangeEvent, UserAccountBalance } from "generated";
import { decodeI64, getISOTime } from "../utils";
import { getHash } from "../utils";
import { nanoid } from "nanoid";

// Define a handler for the CancelOrderEvent within a specific market
AccountBalance.AccountBalanceChangeEvent.handlerWithLoader({
	// Loader function to pre-fetch the user and order details for the specified market
	loader: async ({ event, context }) => {
		return {};
	},


	// Handler function that processes the order cancellation event and updates the order and balance data
	handler: async ({ event, context, loaderReturn }) => {
		// Construct the cancelOrderEvent object and save in context for tracking
		const accountBalanceChangeEvent: AccountBalanceChangeEvent = {
			id: nanoid(),
			trader: event.params.trader.payload.bits,
			market: event.srcAddress,
			baseToken: event.params.base_token.bits,
			takerPositionSize: decodeI64(event.params.account_balance.taker_position_size.underlying),
			takerOpenNotional: decodeI64(event.params.account_balance.taker_open_notional.underlying),
			lastTwPremiumGrowthGlobal: decodeI64(event.params.account_balance.last_tw_premium_growth_global.underlying),
			timestamp: getISOTime(event.block.time),
			txId: event.transaction.id
		};
		context.AccountBalanceChangeEvent.set(accountBalanceChangeEvent);

		const accountBalance: UserAccountBalance = {
			...accountBalanceChangeEvent,
			id: getHash(`${event.params.trader.payload.bits}-${event.srcAddress}`),
			timestamp: getISOTime(event.block.time)
		};
		context.UserAccountBalance.set(accountBalance);
	},
});