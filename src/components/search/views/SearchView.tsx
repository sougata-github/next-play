import CategoriesSection from "../section/CategoriesSection";
import ResultsSection from "../section/ResultsSection";

interface Props {
  query: string | undefined;
  categoryId: string | undefined;
}
const SearchView = ({ query, categoryId }: Props) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 flex flex-col gap-y-6 px-4 pt-2.5">
      <CategoriesSection categoryId={categoryId} />
      <ResultsSection query={query} categoryId={categoryId} />
    </div>
  );
};

export default SearchView;
