import React, {ComponentProps} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import {Theme} from '@material-ui/core/styles';
import {
    AppBar, Box,
    createStyles,
    createTheme,
    Paper, Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow, Tabs,
    withStyles,
    withTheme
} from "@material-ui/core";
import api from "../api";
import { ThemeProvider } from '@material-ui/core';
import Sidebar from "../components/Sidebar";
import Typography from "@material-ui/core/Typography";

const lightTheme = createTheme({
    palette: {
        type: 'light',
    },
});
const darkTheme = createTheme({
    palette: {
        type: 'dark',
    },
});

const useStyles = createStyles((theme: Theme) => ({
    root: {
        display: 'flex',
    },
    paper: {
        marginTop: theme.spacing(3),
        padding: theme.spacing(2, 3)
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        marginTop: theme.spacing(5)
    }
}));

interface IState {
    value: number;
    rank: Map<string, Map<string, number>>;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: any) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
}

class DonationRank extends React.Component<ComponentProps<any>, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            value: 0,
            rank: new Map<string, Map<string, number>>()
        };
    }

    componentDidMount() {
        api.getDonationStats((res: any) => {
            if(res == null) return;
            let map = new Map<string, Map<string, number>>();
            for (const [key, value] of Object.entries(res)) {
                let sub = new Map<string, number>();
                for (const [a, b] of Object.entries(value as Map<any, any>)) {
                    sub.set(a, b);
                }
                map.set(key, sub);
            }
            this.setState({
                rank: map
            });
        });
    }

    render() {
        const classes = this.props.classes;
        const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
            this.setState({
                value: newValue
            })
        };
        return (
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <div className={classes.root}>
                    <Sidebar/>
                    <main className={classes.content}>
                        <ThemeProvider theme={lightTheme}>
                            <Paper className={classes.paper}>
                                <AppBar position="static" color="default">
                                    <Tabs
                                        value={this.state.value}
                                        onChange={handleChange}
                                        indicatorColor="primary"
                                        textColor="primary"
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        aria-label="scrollable auto tabs example"
                                    >
                                        {Array.from(this.state.rank.keys()).map((sv: string, i: number) => (
                                            <Tab label={sv} {...a11yProps(i)} />
                                        ))}
                                    </Tabs>
                                </AppBar>
                                {Array.from(this.state.rank.keys()).map((sv: string, i: number) => (
                                    <TabPanel value={this.state.value} index={i}>
                                        <Typography component="h1" variant="h5">Top nạp thẻ tháng ({sv})</Typography>
                                        <br/>
                                        <TableContainer component={Paper}>
                                            <Table className={classes.table}>
                                                <TableBody>
                                                    {Array.from(this.state.rank.get(sv)!.keys()).map((user: string, i: number) => (
                                                        <TableRow key={user}>
                                                            <TableCell component="th" scope="row">
                                                                {i+1}
                                                            </TableCell>
                                                            <TableCell>
                                                                {user}
                                                            </TableCell>
                                                            <TableCell>
                                                                {this.state.rank.get(sv)!.get(user)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </TabPanel>
                                ))}
                            </Paper>
                        </ThemeProvider>
                    </main>
                </div>
            </ThemeProvider>
        );
    }
}

export default withTheme(withStyles(useStyles)(DonationRank));
