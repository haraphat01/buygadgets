import { getCustomerSession } from "@/lib/customer-auth";
import { AccountNav } from "@/components/storefront/account/account-nav";

// Every /account page is private, session-gated content — no static shell
// to prerender, same reasoning as /admin's layout.
export const instant = false;

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await getCustomerSession();

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-6 md:grid-cols-[200px_1fr]">
      <AccountNav />
      <div>{children}</div>
    </div>
  );
}
