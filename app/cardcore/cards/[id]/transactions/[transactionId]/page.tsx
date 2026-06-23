import { redirect } from "next/navigation";

export default async function CardTransactionDetailsRedirect({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  redirect(`/cardcore/transactions/${transactionId}`);
}
