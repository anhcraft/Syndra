import React, {ComponentProps} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import {Theme} from '@material-ui/core/styles';
import {
    createStyles, createTheme, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    withStyles,
    withTheme
} from "@material-ui/core";
import api from "../api";
import {AccountInfo} from "../AccountInfo";
import { ThemeProvider } from '@material-ui/core';
import Sidebar from "../components/Sidebar";
import {UserInfo} from "../UserInfo";
import moment from "moment";
import {CoinCollection} from "../CoinCollection";
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
        margin: theme.spacing(3),
        padding: theme.spacing(2, 3)
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        marginTop: theme.spacing(5)
    }
}));

interface IState {
    accountInfo: AccountInfo;
    userInfo: UserInfo;
    collections: Map<string, CoinCollection>;
    rank: Map<string, number>;
}

class Profile extends React.Component<ComponentProps<any>, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            accountInfo: {
                user: "",
                email: "",
                admin: false
            },
            userInfo: {
                registerDate: "",
                displayName: "",
                lastIp: "",
                lastLogin: 0,
                email: ""
            },
            collections: new Map<string, CoinCollection>(),
            rank: new Map<string, number>()
        };
    }

    componentDidMount() {
        api.getInfo((res: AccountInfo) => {
            this.setState({
                accountInfo: res
            })
        })
        api.getPlayerInfo((res: UserInfo) => {
            this.setState({
                userInfo: res
            })
        })
        api.getCollections((res: any) => {
            if(res == null) return;
            let map = new Map<string, CoinCollection>();
            for (const [key, value] of Object.entries(res)) {
                map.set(key, value as CoinCollection);
            }
            this.setState({
                collections: map
            });
        });
        api.getDonationTop((res: any) => {
            if(res == null) return;
            let map = new Map<string, number>();
            for (const [key, value] of Object.entries(res)) {
                map.set(key, value as number);
            }
            this.setState({
                rank: map
            });
        });
    }

    render() {
        const classes = this.props.classes;
        return (
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <div className={classes.root}>
                    <Sidebar/>
                    <main className={classes.content}>
                        <Grid container spacing={3}>
                            <ThemeProvider theme={lightTheme}>
                                <Grid item>
                                    <Paper className={classes.paper}>
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell component="th" scope="row">Email</TableCell>
                                                        <TableCell align="right">{this.state.userInfo.email == null || this.state.userInfo.email == "" ? "[Chưa có email]" : this.state.userInfo.email}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell component="th" scope="row">Tên hiển thị</TableCell>
                                                        <TableCell align="right">{this.state.userInfo.displayName == null || this.state.userInfo.displayName == "" ? this.state.accountInfo.user : this.state.userInfo.displayName}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell component="th" scope="row">IP chơi gần nhất</TableCell>
                                                        <TableCell align="right">{this.state.userInfo.lastIp}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell component="th" scope="row">Thời gian chơi gần nhất</TableCell>
                                                        <TableCell align="right">{this.state.userInfo.lastLogin == null ? "" : moment(this.state.userInfo.lastLogin as number).format('YYYY-MM-DD HH:MM:SS')}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell component="th" scope="row">Ngày đăng kí</TableCell>
                                                        <TableCell align="right">{this.state.userInfo.registerDate}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Grid>
                                <Grid item>
                                    <Paper className={classes.paper}>
                                        <TableContainer component={Paper}>
                                            <Table aria-label="simple table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Máy chủ</TableCell>
                                                        <TableCell align="right">Xu</TableCell>
                                                        <TableCell align="right">Điểm tích lũy</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {Array.from(this.state.collections.values()).map((collection: CoinCollection) => (
                                                        <TableRow key={collection.server}>
                                                            <TableCell component="th" scope="row">
                                                                {collection.server}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {collection.coins}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {collection.points}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Grid>
                                <Grid item>
                                    <Paper className={classes.paper}>
                                        <Typography component="h1" variant="h5">Top nạp thẻ tháng</Typography>
                                        <br/>
                                        <TableContainer component={Paper}>
                                            <Table className={classes.table}>
                                                <TableBody>
                                                    {Array.from(this.state.rank.keys()).map((user: string, i: number) => (
                                                        <TableRow key={user}>
                                                            <TableCell component="th" scope="row">
                                                                {i+1}
                                                            </TableCell>
                                                            <TableCell component="th" scope="row">
                                                                {user}
                                                            </TableCell>
                                                            <TableCell>
                                                                {this.state.rank.get(user)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Grid>
                            </ThemeProvider>
                        </Grid>
                    </main>
                </div>
            </ThemeProvider>
        );
    }
}

export default withTheme(withStyles(useStyles)(Profile));
