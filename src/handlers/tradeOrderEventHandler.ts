import {
  TradeOrderEvent,
  Order,
  Market
} from "generated";
import { getISOTime } from "../utils/getISOTime";
import { getHash } from "../utils/getHash";

Market.TradeOrderEvent.handlerWithLoader(
  {
    loader: async ({
      event,
      context,
    }) => {
      return {
        seller_balance: await context.Balance.get(getHash(`${event.params.order_seller.payload.bits}-${event.srcAddress}`)),
        buyer_balance: await context.Balance.get(getHash(`${event.params.order_buyer.payload.bits}-${event.srcAddress}`)),
        sell_order: await context.Order.get(event.params.base_sell_order_id),
        buy_order: await context.Order.get(event.params.base_buy_order_id)
      }
    },

    handler: async ({
      event,
      context,
      loaderReturn
    }) => {

      const tradeOrderEvent: TradeOrderEvent = {
        id: event.transaction.id,
        market: event.srcAddress,
        sell_order_id: event.params.base_sell_order_id,
        buy_order_id: event.params.base_buy_order_id,
        trade_size: event.params.trade_size,
        trade_price: event.params.trade_price,
        seller: event.params.order_seller.payload.bits,
        buyer: event.params.order_buyer.payload.bits,
        seller_base_amount: event.params.s_balance.liquid.base,
        seller_quote_amount: event.params.s_balance.liquid.quote,
        buyer_base_amount: event.params.b_balance.liquid.base,
        buyer_quote_amount: event.params.b_balance.liquid.quote,
        timestamp: getISOTime(event.block.time),
        // tx_id: event.transaction.id,
      };

      context.TradeOrderEvent.set(tradeOrderEvent);

      const buy_order = loaderReturn.buy_order;
      const sell_order = loaderReturn.sell_order;

      if (!buy_order || !sell_order) {
        context.log.error(`Cannot find orders: buy_order_id: ${event.params.base_buy_order_id}, sell_order_id: ${event.params.base_sell_order_id}`);
        return;
      }

      const updatedBuyAmount = buy_order.amount - event.params.trade_size;
      const isBuyOrderClosed = updatedBuyAmount === 0n;

      const updatedBuyOrder: Order = {
        ...buy_order,
        amount: updatedBuyAmount,
        status: isBuyOrderClosed ? "Closed" : "Active",
        timestamp: getISOTime(event.block.time),
      };

      const updatedSellAmount = sell_order.amount - event.params.trade_size;
      const isSellOrderClosed = updatedSellAmount === 0n;

      const updatedSellOrder: Order = {
        ...sell_order,
        amount: updatedSellAmount,
        status: isSellOrderClosed ? "Closed" : "Active",
        timestamp: getISOTime(event.block.time),
      };

      context.Order.set(updatedBuyOrder);
      context.Order.set(updatedSellOrder);

      if (isBuyOrderClosed) {
        context.ActiveBuyOrder.deleteUnsafe(buy_order.id);
      } else {
        context.ActiveBuyOrder.set(updatedBuyOrder);
      }

      if (isSellOrderClosed) {
        context.ActiveSellOrder.deleteUnsafe(sell_order.id);
      } else {
        context.ActiveSellOrder.set(updatedSellOrder);
      }
      const seller_balance = loaderReturn.seller_balance;
      const buyer_balance = loaderReturn.buyer_balance;

      if (!seller_balance || !buyer_balance) {
        context.log.error(`Cannot find balances: seller: ${getHash(`${event.params.order_seller.payload.bits}-${event.srcAddress}`)}, 
        buyer: ${getHash(`${event.params.order_buyer.payload.bits}-${event.srcAddress}`)}`);
        return;
      }

      const updatedSellerBalance = {
        ...seller_balance,
        base_amount: event.params.s_balance.liquid.base,
        quote_amount: event.params.s_balance.liquid.quote,
        timestamp: getISOTime(event.block.time),
      };

      context.Balance.set(updatedSellerBalance);

      const updatedBuyerBalance = {
        ...buyer_balance,
        base_amount: event.params.b_balance.liquid.base,
        quote_amount: event.params.b_balance.liquid.quote,
        timestamp: getISOTime(event.block.time),
      };

      context.Balance.set(updatedBuyerBalance);
    }
  }
)