import React, {ComponentProps} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import {Theme} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {
    createStyles, createTheme, Divider,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    withStyles,
    withTheme
} from "@material-ui/core";
import api from "../api";
import {AccountInfo} from "../AccountInfo";
import { ThemeProvider } from '@material-ui/core';
import Sidebar from "../components/Sidebar";
import {UserInfo} from "../UserInfo";
import {Transaction} from "../Transaction";
import moment from "moment";
import {CoinCollection} from "../CoinCollection";
import Typography from "@material-ui/core/Typography";
import { Button } from '@material-ui/core';

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
    code: number;
    emailCode: number;
    collections: Map<string, CoinCollection>;
    rank: Map<string, number>;
}

class Profile extends React.Component<ComponentProps<any>, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            accountInfo: {
                user: "",
                email: ""
            },
            userInfo: {
                registerDate: "",
                displayName: "",
                lastIp: "",
                lastLogin: 0,
                email: ""
            },
            code: -1,
            emailCode: -1,
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
                                        <br/><Divider/><br/>
                                        <Typography component="h5" variant="h5">Đổi email</Typography>
                                        <form className={classes.form} onSubmit={this.changeEmail.bind(this)} noValidate>
                                            <TextField
                                                variant="outlined"
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="email"
                                                label="Email mới"
                                                type="email"
                                                id="email"
                                                error={this.state.emailCode > 0}
                                            />
                                            <Typography>
                                                {this.state.emailCode == 0 && "Đổi email thành công!"}
                                                {this.state.emailCode == 1 && "Email không hợp lệ!"}
                                                {this.state.emailCode == 2 && "Lỗi xử lý từ máy chủ. Vui lòng báo lại admin!"}
                                            </Typography>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                className={classes.submit}
                                            >
                                                Đổi email
                                            </Button>
                                            <ul>
                                                <li>Đặt đúng email để có thể lấy lại tài khoản nếu quên mật khẩu</li>
                                            </ul>
                                        </form>
                                        <br/><Divider/><br/>
                                        <Typography component="h5" variant="h5">Đổi mật khẩu</Typography>
                                        <form className={classes.form} onSubmit={this.changePassword.bind(this)} noValidate>
                                            <TextField
                                                variant="outlined"
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="pass1"
                                                label="Mật khẩu hiện tại"
                                                type="password"
                                                id="pass1"
                                                error={this.state.code > 0}
                                            />
                                            <TextField
                                                variant="outlined"
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="pass2"
                                                label="Mật khẩu mới (8-30 kí tự)"
                                                type="password"
                                                id="pass2"
                                                error={this.state.code > 0 && this.state.code != 2}
                                            />
                                            <Typography>
                                                {this.state.code == 0 && "Đổi mật khẩu thành công!"}
                                                {this.state.code == 1 && "Vui lòng nhập đủ thông tin!"}
                                                {this.state.code == 2 && "Sai mật khẩu hiện tại!"}
                                                {this.state.code == 3 && "Mật khẩu mới phải từ 8 - 30 kí tự!"}
                                                {this.state.code == 4 && "Lỗi xử lý từ máy chủ. Vui lòng báo lại admin!"}
                                            </Typography>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                className={classes.submit}
                                            >
                                                Đổi mật khẩu
                                            </Button>
                                            <ul>
                                                <li>Không đặt các mật khẩu dễ như “123456” tránh bị mất tài khoản</li>
                                                <li>Nên đặt mật khẩu bao gồm chữ cái, số và ký tự đặc biệt</li>
                                            </ul>
                                        </form>
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

    changePassword(event: React.FormEvent) {
        event.preventDefault()
        const form = event.target as HTMLFormElement;
        const pass1 = (form.elements.namedItem("pass1") as HTMLInputElement).value.trim();
        const pass2 = (form.elements.namedItem("pass2") as HTMLInputElement).value.trim();
        if(pass1.length == 0 || pass2.length == 0) {
            this.setState({code: 1})
            return
        }
        api.changePassword(pass1, pass2, (res: any) => {
            if(res == null) {
                this.setState({code: 4});
                return;
            }
            if(res["code"] as number == 0) {
                this.setState({code: 0});
                setTimeout(function () {
                    window.location.reload(true);
                }, 2000);
            } else {
                this.setState({
                    code: res["code"] as number
                });
            }
        });
    }

    changeEmail(event: React.FormEvent) {
        event.preventDefault()
        const form = event.target as HTMLFormElement;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
        if(email.length == 0) {
            this.setState({emailCode: 1})
            return
        }
        if(!(/^\S+@\S+$/.test(email))) {
            this.setState({emailCode: 1})
            return
        }
        api.changeEmail(email, (res: any) => {
            if(res == null) {
                this.setState({emailCode: 2});
                return;
            }
            if(res["code"] as number == 0) {
                this.setState({emailCode: 0});
                setTimeout(function () {
                    window.location.reload(true);
                }, 2000);
            } else {
                this.setState({
                    emailCode: res["code"] as number
                });
            }
        });
    }
}

export default withTheme(withStyles(useStyles)(Profile));
