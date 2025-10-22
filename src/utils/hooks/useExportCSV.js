import Api from '@/utils/axios/api';
import { App } from 'antd';
import moment from 'moment';
import Papa from 'papaparse';
import { useState } from 'react';

/**
 * Custom hook for exporting data to CSV
 * @param {Object} config - Configuration object
 * @param {string} config.endpoint - API endpoint to fetch data
 * @param {Object} config.defaultParams - Default parameters for API request
 * @param {Array<string|Object>} config.selectedKeys - Keys to extract from data for CSV
 * @param {string} config.filename - Base filename for CSV (without extension and timestamp)
 * @param {Function} config.transformData - Optional function to transform data before CSV conversion
 * @param {Object} config.csvOptions - Optional Papa Parse options
 * @returns {Object} - { exportToCSV, isExporting }
 */
const useExportCSV = ({
  endpoint,
  defaultParams = {},
  selectedKeys = [],
  filename = 'export',
  transformData = null,
  csvOptions = {},
}) => {
  const { message } = App.useApp();
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Extract selected keys from data item
   * @param {Object} item - Data item
   * @param {Array} keys - Array of keys to extract
   * @returns {Object} - Extracted data
   */
  const extractSelectedKeys = (item, keys) => {
    const result = {};

    for (const key of keys) {
      if (typeof key === 'string') {
        // Simple key extraction with dot notation support
        result[key] = getNestedValue(item, key);
      } else if (typeof key === 'object') {
        // Object format: { key: 'displayName', path: 'nested.path', default: 'defaultValue' }
        const { key: displayKey, path, default: defaultValue = '-' } = key;
        result[displayKey] = getNestedValue(item, path) || defaultValue;
      }
    }

    return result;
  };

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Source object
   * @param {string} path - Dot notation path (e.g., 'emails.0.value')
   * @returns {any} - Value at path or undefined
   */
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object') {
        // Handle array access (e.g., emails.0.value)
        if (!Number.isNaN(Number(key)) && Array.isArray(current)) {
          return current[Number.parseInt(key)];
        }
        return current[key];
      }
      return undefined;
    }, obj);
  };

  /**
   * Flatten object for CSV compatibility
   * @param {Object} obj - Object to flatten
   * @returns {Object} - Flattened object
   */
  const flattenObject = (obj, prefix = '') => {
    const flattened = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (
          obj[key] !== null &&
          typeof obj[key] === 'object' &&
          !Array.isArray(obj[key])
        ) {
          Object.assign(flattened, flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }

    return flattened;
  };

  /**
   * Export data to CSV
   * @param {Object} options - Export options
   * @param {Object} options.params - Additional parameters for API request
   * @param {Array} options.keys - Override selectedKeys for this export
   * @param {string} options.customFilename - Override filename for this export
   */
  const exportToCSV = async (options = {}) => {
    const {
      params: additionalParams = {},
      keys: customKeys = selectedKeys,
      customFilename = filename,
    } = options;

    try {
      setIsExporting(true);

      // Merge default params with additional params
      const requestParams = {
        is_skip_pagination: true,
        ...defaultParams,
        ...additionalParams,
      };

      // Make API request
      const response = await Api().get(endpoint, {
        params: requestParams,
      });

      // Check if data exists
      if (!response.data?.results?.length) {
        message.warning('No data to export');
        return;
      }

      // Extract selected keys from data
      let csvData = response.data.results.map((item) =>
        extractSelectedKeys(item, customKeys),
      );

      // Apply custom transformation if provided
      if (transformData && typeof transformData === 'function') {
        csvData = transformData(csvData);
      }

      // Flatten objects for CSV compatibility
      const flattenedData = csvData.map((item) => flattenObject(item));

      // Default CSV options
      const defaultCSVOptions = {
        header: true,
        delimiter: ',',
        encoding: 'utf-8',
      };

      // Convert to CSV
      const csv = Papa.unparse(flattenedData, {
        ...defaultCSVOptions,
        ...csvOptions,
      });

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');

      link.setAttribute('href', url);
      link.setAttribute('download', `${customFilename}_${timestamp}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export data');
      throw error; // Re-throw for component handling if needed
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToCSV,
    isExporting,
  };
};

export default useExportCSV;

// Example 1: Basic Usage - Contacts Export
// import useExportCSV from '@/hooks/useExportCSV';

// const ContactsComponent = () => {
//   // Simple string keys for basic data extraction
//   const { exportToCSV, isExporting } = useExportCSV({
//     endpoint: '/api/contacts',
//     selectedKeys: [
//       'id',
//       'name',
//       'code',
//       'emails.0.value', // Nested array access
//       'phones.0.value'
//     ],
//     filename: 'contacts',
//     defaultParams: {
//       includes: ['emails', 'phones']
//     }
//   });

//   return (
//     <Button
//       variant="outlined"
//       color="primary"
//       onClick={() => exportToCSV()}
//       loading={isExporting}
//     >
//       <LucideDownload size={16} />
//       Export Contacts
//     </Button>
//   );
// };

// Example 2: Advanced Usage - Custom Key Mapping
// const AdvancedContactsComponent = () => {
//   const { exportToCSV, isExporting } = useExportCSV({
//     endpoint: '/api/contacts',
//     selectedKeys: [
//       'id',
//       { key: 'Contact Name', path: 'name' },
//       { key: 'Contact Code', path: 'code' },
//       { key: 'Primary Email', path: 'emails.0.value', default: 'No Email' },
//       { key: 'Primary Phone', path: 'phones.0.value', default: 'No Phone' },
//       { key: 'Company', path: 'company.name', default: 'N/A' },
//       { key: 'Status', path: 'status' }
//     ],
//     filename: 'contacts_detailed',
//     defaultParams: {
//       includes: ['emails', 'phones', 'company']
//     }
//   });

//   return (
//     <Button onClick={() => exportToCSV()}>
//       Export Detailed Contacts
//     </Button>
//   );
// };
