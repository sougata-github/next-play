"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_URL } from "@/constants";
import { SearchIcon, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const SearchInput = () => {
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("query") || "");
  const router = useRouter();

  const categoryId = searchParams.get("categoryId") || "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = new URL("/search", APP_URL);

    const newQuery = value.trim();

    url.searchParams.set("query", encodeURIComponent(newQuery));

    if (categoryId) {
      url.searchParams.set("categoryId", categoryId);
    }

    if (newQuery === "") {
      url.searchParams.delete("query");
    }

    setValue(newQuery);

    router.push(url.toString());
  };

  return (
    <form
      className="relative flex w-full max-w-[600px] items-center rounded-full outline outline-muted-foreground/15 outline-2"
      onSubmit={handleSubmit}
    >
      <div className="relative w-full">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          placeholder="Search"
          className="w-full py-2 outline-none border-none shadow-none focus:outline-none focus-visible:outline-none focus:ring-2 focus-visible:ring-2 focus-visible:ring-ring focus:ring-ring pl-4 h-full rounded-l-full"
        />
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => {
              setValue("");
            }}
            className="z-20 absolute rounded-none right-2 top-1/2 -translate-y-1/2 hover:bg-transparent bg-transparent"
          >
            <X />
          </Button>
        )}
      </div>

      <Button
        variant="secondary"
        disabled={!value.trim()}
        type="submit"
        className="px-5 py-2.5 bg-gray-100 dark:bg-transparent rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SearchIcon className="size-5" />
      </Button>
    </form>
  );
};

export default SearchInput;
