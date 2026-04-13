import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

const Pagination = ({ currentPage, onPageChange, totalPages }: PaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <section className="w-full px-6 py-8">
      <div className="flex justify-start items-center gap-2">
        <Button
          className="p-2 hover:bg-transparent hover:opacity-50 disabled:opacity-30 -ml-2"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          size="sm"
          variant="ghost"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page) => (
            <Button
              className={`min-w-8 h-8 hover:bg-transparent text-sm ${
                page === currentPage ? "underline font-normal" : "hover:underline font-light"
              }`}
              key={page}
              onClick={() => onPageChange(page)}
              size="sm"
              variant="ghost"
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          className="p-2 hover:bg-transparent hover:opacity-50 disabled:opacity-30"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          size="sm"
          variant="ghost"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export default Pagination;