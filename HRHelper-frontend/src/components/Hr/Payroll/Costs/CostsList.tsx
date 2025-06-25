import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { Link as RouterLink } from "react-router-dom";
import type { DepartmentCosts } from "../../../../types/payrollDTO";
import { getCostsByParams } from "../../../../services/departmentCostsService";
import type { CostType } from "../../../../enums/enums";

const CostsList = () => {
  const [costs, setCosts] = useState<DepartmentCosts[]>([]);
  const [filteredCosts, setFilteredCosts] = useState<DepartmentCosts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [costTypeFilter, setCostTypeFilter] = useState("all");

  const costTypes: CostType[] = [
    "SALARIES",
    "TRAINING",
    "DEVELOPMENT",
    "RECRUITMENT",
    "ONBOARDING",
    "HEALTH_AND_SAFETY",
    "OFFICE_SPACE",
    "SUPPLIES",
    "LEGAL",
    "CONSULTING",
    "OTHER"
  ];
  

    async function loadCosts() {
        const costList: DepartmentCosts[] = await getCostsByParams(undefined, undefined, undefined, undefined, undefined);
        setCosts(costList);
        setFilteredCosts(costList);
        setLoading(false);
    }

    useEffect(() => {
        loadCosts();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase();

        const filtered = costs
        .filter((cost) =>
            (cost.department + " " + cost.costType).toLowerCase().includes(query)
        )
        .filter(
            (cost) =>
            costTypeFilter === "all" ||
            cost.costType.toLowerCase() === costTypeFilter.toLowerCase()
        );

        setFilteredCosts(filtered);
    }, [searchQuery, costTypeFilter, costs]);

    if (loading) {
        return (
        <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
        </Box>
        );
    }

    return (
        <Box px={3}>
        {/* Top Controls */}
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            mb={2}
            gap={2}
        >
            <Box display="flex" gap={2}>
            {/* Search bar */}
            <TextField
                placeholder="Search by department or type"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white', // Text color
                      '& fieldset': {
                        borderColor: 'white', // Default border
                      },
                      '&:hover fieldset': {
                        borderColor: 'white', // Hover border
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white', // Focused border
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white',
                    },
                    '& .MuiInputAdornment-root': {
                      color: 'white',
                    },
                    backgroundColor: 'transparent',
                  }}
                InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                    </InputAdornment>
                ),
                }}
            />

            {/* Cost Type Filter */}
            <TextField
                select
                size="small"
                label="Cost Type"
                value={costTypeFilter}
                sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white', // Text color
                      '& fieldset': {
                        borderColor: 'white', // Default border
                      },
                      '&:hover fieldset': {
                        borderColor: 'white', // Hover border
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white', // Focused border
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white',
                    },
                    '& .MuiInputAdornment-root': {
                      color: 'white',
                    },
                    backgroundColor: 'transparent',
                  }}
                onChange={(e) => setCostTypeFilter(e.target.value)}
            >
            <MenuItem value="all">All</MenuItem>
            {costTypes.map((type) => (
                <MenuItem key={type} value={type}>
                {type.toLocaleLowerCase()}
                </MenuItem>
            ))}
            </TextField>
            </Box>

            <Button variant="contained" component={RouterLink} to="/costs/add">
            Add Cost Entry
            </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ mb: 2, minHeight: 300, minWidth: "1050px" }}>
            <Table>
            <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Department</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Cost Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {filteredCosts.map((cost, index) => (
                <TableRow key={cost.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{cost.department}</TableCell>
                    <TableCell>{cost.costType}</TableCell>
                    <TableCell>
                    {cost.amount.toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                    })}
                    </TableCell>
                    <TableCell>
                    {new Date(cost.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                    <Button
                        variant="outlined"
                        size="small"
                        component={RouterLink}
                        to={`/costs/${cost.id}`}
                    >
                        View Details
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    );
    };

export default CostsList;
