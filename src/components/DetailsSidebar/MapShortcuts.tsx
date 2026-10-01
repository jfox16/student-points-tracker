interface MapShortcutsProps {
  showSelectionHelp: boolean;
}

export const MapShortcuts = ({
  showSelectionHelp,
}: MapShortcutsProps) => (
  <div className="DetailsSidebar__shortcuts">
    {showSelectionHelp ? (
      <>
        <div className="DetailsSidebar__shortcutList">
          <span className="DetailsSidebar__shortcutHeading">Selection</span>
          <span><kbd>⌘/Ctrl</kbd> click or drag adds to selection</span>
          <span><kbd>Shift</kbd> click or drag removes from selection</span>
          <span><kbd>Double-click</kbd> or <kbd>⌘/Ctrl</kbd>+<kbd>A</kbd> selects all</span>
          <span><kbd>Esc</kbd> clears selection</span>
          <span><kbd>Backspace</kbd> deletes</span>
        </div>
        <div className="DetailsSidebar__shortcutList">
          <span className="DetailsSidebar__shortcutHeading">Groups</span>
          <span><kbd>⌘/Ctrl</kbd> + <kbd>1–8</kbd> sets or clears group</span>
          <span><kbd>⌘/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>1–8</kbd> adds to group</span>
          <span><kbd>Option/Alt</kbd> + <kbd>1–8</kbd> removes from group</span>
          <span>A desk can be in one group at a time</span>
        </div>
      </>
    ) : (
      <>
        <div className="DetailsSidebar__shortcutList">
          <span className="DetailsSidebar__shortcutHeading">Groups</span>
          <span><kbd>1–8</kbd> +1 point to group</span>
          <span><kbd>Shift</kbd> + <kbd>1–8</kbd> −1 point to group</span>
          <span>Select desks, then <kbd>⌘/Ctrl</kbd> + <kbd>1–8</kbd> to set a group</span>
        </div>
        <div className="DetailsSidebar__shortcutList">
          <span className="DetailsSidebar__shortcutHeading">Map</span>
          <span><kbd>Space</kbd> + drag pans</span>
          <span><kbd>⌘/Ctrl</kbd>+<kbd>C</kbd>/<kbd>V</kbd> copy and paste</span>
          <span>Drag a classroom edge to resize</span>
        </div>
      </>
    )}
  </div>
);
