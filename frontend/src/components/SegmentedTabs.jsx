function SegmentedTabs({ tabs, activeKey, onChange }) {
  return (
    <div className="tab-strip" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`tab-button ${activeKey === tab.key ? "active" : ""}`}
          onClick={() => onChange(tab.key)}
          role="tab"
          aria-selected={activeKey === tab.key}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default SegmentedTabs;
