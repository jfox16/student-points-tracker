/**
 * Moves an element within an array from one index to another.
 * If moving to index `n`, elements at `n` and greater shift one position up.
 * @param arr The array.
 * @param fromIndex The current index of the item.
 * @param toIndex The new index to move the item to.
 * @returns A new array with the item moved.
 */
export const moveItem = <T,>(arr: T[], fromIndex: number, toIndex: number): T[] =>
  fromIndex === toIndex || toIndex < 0 || toIndex >= arr.length
    ? arr
    : [
        ...arr.filter((_, i) => i !== fromIndex).slice(0, toIndex),
        arr[fromIndex],
        ...arr.filter((_, i) => i !== fromIndex).slice(toIndex),
      ];

/** Hover index is a gap in the original list: 0 is before the first item. */
export const reorderDestination = (fromIndex: number, hoverIndex: number) =>
  fromIndex < hoverIndex ? hoverIndex - 1 : hoverIndex;
