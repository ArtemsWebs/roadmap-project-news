interface DynamicFastFilterBlock {
  id: string;
  name: string;
  icon: React.ReactNode;
  value: string;
  textColor: string;
}
interface DynamicFastFilterBlockProps {
  dynamicFastFilter: DynamicFastFilterBlock[];
}

export const DynamicFastFilterBlock = ({
  dynamicFastFilter,
}: DynamicFastFilterBlockProps) => {
  return dynamicFastFilter ? (
    <div>
      {dynamicFastFilter.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  ) : null;
};
