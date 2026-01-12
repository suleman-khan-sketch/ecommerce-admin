import Link from "next/link";
import { ExternalLink, FileQuestion } from "lucide-react";

import Typography from "@/components/ui/typography";

export function NotFound({ page = "Page" }: { page?: string }) {
  return (
    <div className="py-16 sm:py-20 w-full h-full grid place-items-center px-2 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <FileQuestion className="w-32 h-32 text-muted-foreground opacity-50" />
        </div>

        <div className="flex flex-col text-center items-center space-y-4">
          <Typography
            variant="h1"
            className="text-3xl min-[360px]:text-4xl md:text-5xl"
          >
            {page} not found!
          </Typography>

          <Typography
            component="p"
            className="text-sm min-[360px]:text-base md:text-lg font-semibold flex items-center gap-x-2"
          >
            Go to{" "}
            <Link
              href="/"
              className="underline text-primary flex items-center gap-x-1 dark:text-primary/90"
            >
              Dashboard <ExternalLink className="size-4 md:size-5" />
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
}
