import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalCount, 
  pageSize, 
  itemLabel = 'mục' 
}) => {
  if (totalPages <= 0) return null;

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Calculate info text
  const start = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Hiển thị {start !== end ? `${start}-${end}` : start} trên tổng số {totalCount} {itemLabel}
      </div>
      <div className="pagination-controls">
        <button
          className="page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
        >
          Trước
        </button>

        {/* Basic page numbers - could be enhanced to show ... for many pages */}
        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNum = index + 1;
          // Simple logic: show all for now, as per original code
          // But maybe limit if totalPages > 10?
          if (totalPages > 10) {
             if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
             }
             if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                return <span key={pageNum} className="pagination-ellipsis">...</span>;
             }
             return null;
          }

          return (
            <button
              key={pageNum}
              className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          className="page-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default Pagination;
