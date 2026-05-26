function SkeletonRows({ rows = 5, columns = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
              <span className="skeleton-block skeleton-row" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default SkeletonRows;
