import Link from "next/link";
import Header2 from "@/components/mvpblocks/header-2";
import { ResetPasswordForm } from "@/components/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SearchParams = Record<string, string | string[] | undefined>;

type ResetPasswordPageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

const resolveSearchParams = async (
  searchParams: ResetPasswordPageProps["searchParams"]
): Promise<SearchParams | undefined> => {
  if (!searchParams) return undefined;

  if (
    typeof searchParams === "object" &&
    searchParams !== null &&
    "then" in searchParams &&
    typeof (searchParams as Promise<SearchParams>).then === "function"
  ) {
    return await searchParams;
  }

  return searchParams;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const tokenParam = resolvedSearchParams?.token;
  const token =
    typeof tokenParam === "string"
      ? tokenParam
      : Array.isArray(tokenParam)
        ? tokenParam[0] ?? ""
        : "";
  const hasToken = Boolean(token);

  return (
    <div className="min-h-screen flex flex-col">
      <Header2 />
      <main className="flex-1 bg-muted flex items-center justify-center p-6 md:p-10 pt-20">
        <div className="w-full max-w-md">
          {hasToken ? (
            <ResetPasswordForm token={token} />
          ) : (
            <Card>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-semibold">
                  Token inválido
                </CardTitle>
                <CardDescription>
                  Não encontramos um token de redefinição válido. Solicite uma
                  nova recuperação de senha.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/forgot-password">Solicitar nova recuperação</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
