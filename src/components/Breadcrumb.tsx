import { motion } from 'motion/react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-sm mb-6"
    >
      <button
        onClick={() => onNavigate?.('dashboard')}
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-[#F24C20] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.path && index < items.length - 1 ? (
            <button
              onClick={() => onNavigate?.(item.path!)}
              className="text-gray-500 dark:text-gray-400 hover:text-[#F24C20] transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-[#044071] dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </motion.div>
  );
}
