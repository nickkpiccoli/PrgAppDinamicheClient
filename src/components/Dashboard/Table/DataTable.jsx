import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const DataTable = ({
  filteredData,
  visibleColumns,
  columnDefinitions,
  handleSort,
  sortConfig,
  type,
  handleRowClick,
  handleEdit,
  handleShowDescription,
}) => {
  const onSort = (column) => {
    if (column === 'description') return; // la descrizione non si ordina!
    const direction =
      sortConfig.key === column && sortConfig.direction === 'ascending'
        ? 'descending'
        : 'ascending';
    handleSort(column, direction);
  };

  const renderCellContent = (item, column) => {
    const isClickable =
      (column === 'cust_name' && (type === 'agent' || type === 'dirigent')) ||
      (column === 'agent_name' && (type === 'customer' || type === 'dirigent'));

    if (isClickable) {
      return (
        <Button color="primary" onClick={() => handleRowClick(item, column)}>
          {item[column]}
        </Button>
      );
    }

    if (column === 'description') {
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={(e) => {
            handleShowDescription(item);
            e.stopPropagation(); // evita il bubble up dell'evento
          }}
        >
          Dettagli
        </Button>
      );
    }

    return item[column];
  };

  const handleKeyboard = (event, column) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSort(column);
    }
  };

  const tableHeaders = useMemo(
    () =>
      Object.keys(visibleColumns)
        .filter((key) => visibleColumns[key])
        .map((column) => (
          <TableCell
            key={column}
            onClick={() => onSort(column)}
            style={{ cursor: 'pointer' }}
            tabIndex={0}
            onKeyDown={(event) => handleKeyboard(event, column)}
            aria-label={`Ordina per ${columnDefinitions[column].displayName}`}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {columnDefinitions[column].displayName}
              {sortConfig.key === column &&
                (sortConfig.direction === 'ascending' ? (
                  <ArrowUpwardIcon fontSize="small" />
                ) : (
                  <ArrowDownwardIcon fontSize="small" />
                ))}
            </div>
          </TableCell>
        )),
    [visibleColumns, columnDefinitions, sortConfig]
  );

  const renderRows = () =>
    filteredData.map((item, rowIndex) => (
      <TableRow
        key={item.id || item.ord_num}
        aria-label={`Riga numero ${rowIndex + 1} dei dati per ${item.cust_name || item.agent_name || item.id}`}
      >
        {Object.keys(visibleColumns)
          .filter((key) => visibleColumns[key])
          .map((column) => (
            <TableCell
              key={column}
              tabIndex={0}
              aria-label={`Colonna ${columnDefinitions[column].displayName}, riga numero ${rowIndex + 1} di ${item.cust_name || item.agent_name || item.id}, valore dell'elemento: ${item[column]}`}
            >
              {renderCellContent(item, column)}
            </TableCell>
          ))}
        {(type === 'agent' || type === 'dirigent') && (
          <TableCell tabIndex={0} aria-label="Colonna delle azioni">
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation(); // evita il bubble up dell'evento
                handleEdit(item);
              }}
            >
              Modifica
            </Button>
          </TableCell>
        )}
      </TableRow>
    ));

  return (
    <TableContainer component={Paper} aria-label="Tabella dei dati">
      <Table className="data-table">
        <TableHead>
          <TableRow aria-label="Intestazioni della tabella">
            {tableHeaders}
            {(type === 'agent' || type === 'dirigent') && (
              <TableCell tabIndex={0} aria-label="Colonna delle azioni">
                Azioni
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>{renderRows()}</TableBody>
      </Table>
    </TableContainer>
  );
};

DataTable.propTypes = {
  filteredData: PropTypes.array.isRequired,
  visibleColumns: PropTypes.object.isRequired,
  columnDefinitions: PropTypes.object.isRequired,
  handleSort: PropTypes.func.isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['ascending', 'descending']),
  }).isRequired,
  handleRowClick: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['agent', 'customer', 'dirigent']).isRequired,
  handleShowDescription: PropTypes.func.isRequired,
};

export default React.memo(DataTable);
