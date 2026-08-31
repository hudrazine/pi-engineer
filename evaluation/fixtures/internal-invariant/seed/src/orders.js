const TERMINAL_STATUSES = new Set(["paid", "cancelled"]);

export function parseTerminalOrder(input) {
  if (
    typeof input !== "object" ||
    input === null ||
    typeof input.id !== "string" ||
    !TERMINAL_STATUSES.has(input.status)
  ) {
    throw new TypeError("invalid terminal order");
  }

  return { id: input.id, status: input.status };
}

// Internal callers pass only values returned by parseTerminalOrder.
export function summarizeValidatedOrder(order) {
  return `${order.id}:${order.status}`;
}
