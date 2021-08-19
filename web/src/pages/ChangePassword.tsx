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
import ReCAPTCHA from "react-google-recaptcha";

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
    code: number;
}

class ChangePassword extends React.Component<ComponentProps<any>, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            code: -1,
        };
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
}

export default withTheme(withStyles(useStyles)(ChangePassword));
