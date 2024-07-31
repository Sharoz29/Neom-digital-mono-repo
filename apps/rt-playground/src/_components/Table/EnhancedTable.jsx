import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { alpha, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TablePagination, IconButton, Toolbar, Typography, Paper, Tooltip, TextField } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import VisibilityIcon from '@mui/icons-material/Visibility';

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
}

function EnhancedTableHead({ columns, order, orderBy, onRequestSort }) {
    const createSortHandler = property => event => onRequestSort(event, property);

    return (
        <TableHead>
            <TableRow>
                {columns.map(column => (
                    <TableCell
                        key={column.id}
                        align={column.numeric ? 'right' : 'left'}
                        padding={column.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === column.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : 'asc'}
                            onClick={createSortHandler(column.id)}
                        >
                            {column.label}
                            {orderBy === column.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

function EnhancedTableToolbar({ title, searchQuery, setSearchQuery }) {
    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                {title}
            </Typography>
            <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                variant="outlined"
                size="small"
                sx={{ marginLeft: 2 }}
            />
        </Toolbar>
    );
}

function EnhancedTable({ rows, columns, title, onActionClick }) {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState(columns[0].id);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const filteredRows = rows.filter(row => {
        return columns.some(column => {
            const value = row[column.id];
            return value ? value.toString().toLowerCase().includes(searchQuery.toLowerCase()) : false;
        });
    });

    return (
      <div style={{
        display:'flex',
        justifyContent:'center'
      }}>


        <Box sx={{ width: '98%' }}>
            <Paper sx={{  mb: 2 }}>
                <EnhancedTableToolbar title={title} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={'medium'}
                        >
                        <EnhancedTableHead
                            columns={columns}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            />
                        <TableBody>
                            {stableSort(filteredRows, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`;
                                    
                                    return (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            tabIndex={-1}
                                            key={row.id}
                                            >
                                            {columns.map((column) => (
                                              <TableCell key={column.id} align={column.numeric ? 'right' : 'left'}>
                                                    {column.id === 'action' ? (
                                                      <IconButton onClick={() => onActionClick(row.id,'view')}>
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    ) : (
                                                        row[column.id]
                                                      )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                  })}
                            {emptyRows > 0 && (
                              <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={columns.length} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    />
            </Paper>
        </Box>
</div>
    );
}

EnhancedTable.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  onActionClick: PropTypes.func.isRequired
};

export default EnhancedTable;
