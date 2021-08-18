import React, {ComponentProps} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {Theme} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {createStyles, Paper, withStyles, withTheme} from "@material-ui/core";
import background from "../resources/background.jpg"
import api from "../api";
import ReactDOM from "react-dom";
import Register from "./Register";
import ReCAPTCHA from "react-google-recaptcha";

const useStyles = createStyles((theme: Theme) => ({
    container: {
        paddingTop: theme.spacing(7)
    },
    paper: {
        width: theme.spacing(70),
        marginTop: theme.spacing(3),
        margin: "auto",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(2, 3)
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
        width: theme.spacing(7),
        height: theme.spacing(7),
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    background: {
        position: "fixed",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: -2
    },
    overlay: {
        position: "fixed",
        backgroundColor: "#000",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: -1,
        opacity: 0.5
    }
}));

interface IState {
    online: number;
    code: number;
    captcha: string;
    email: string;
}

class Recovery extends React.Component<ComponentProps<any>, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            online: 0,
            code: -1,
            captcha: "",
            email: ""
        };
    }

    componentDidMount() {
        api.getOnlinePlayers((res: number) => {
            this.setState({
                online: res
            })
        })
    }

    render() {
        const classes = this.props.classes;
        return (
            <Container component="main" className={classes.container}>
                <div className={classes.background}/>
                <div className={classes.overlay}/>
                <CssBaseline />
                <Paper className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon fontSize="large" />
                    </Avatar>
                    <Typography component="h1" variant="h5">Khôi phục tài khoản</Typography>
                    <form className={classes.form} onSubmit={this.handleSubmit.bind(this)} noValidate>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="user"
                            label="Tài khoản"
                            name="user"
                            autoFocus
                            error={this.state.code == 1 || this.state.code == 2}
                        />
                        <p>Bạn vui lòng xác nhận yêu cầu lấy lại mật khẩu:</p>
                        <ReCAPTCHA
                            sitekey="6LcSvAscAAAAAP9KKw1zKFWt12devap5KnuRGJeD"
                            hl="vi"
                            onChange={this.verifyCaptcha.bind(this)}
                        />
                        <p>Một bức thư sẽ được gửi tới email của bạn. Hãy làm theo hưỡng dẫn trong mail đó để khôi phục lại tài khoản!</p>
                        <p>
                            {this.state.code == 0 && `Một bức thư đã được gửi tới ${this.state.email}! Hãy vào hòm thư kiểm tra.`}
                            {this.state.code == 1 && "Vui lòng nhập tài khoản."}
                            {this.state.code == 2 && "Tài khoản này không tồn tại."}
                            {this.state.code == 3 && "Vui lòng xác minh captcha."}
                            {this.state.code == 4 && "Xác minh captcha thất bại."}
                            {this.state.code == 5 && "Lỗi xử lý. Vui lòng báo lại admin!"}
                            {this.state.code == 6 && "Tài khoản này chưa được thiết lập email! Liên hệ admin để nhận trợ giúp."}
                        </p>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Đồng ý
                        </Button>
                    </form>
                </Paper>
                <Paper className={classes.paper}>
                    <b>IP Server: Minehot.com | Online: {this.state.online}</b>
                </Paper>
            </Container>
        );
    }

    verifyCaptcha(tkn: string | null){
        this.setState({captcha: tkn == null ? "" : tkn})
    }

    handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        const form = event.target as HTMLFormElement;
        const user = (form.elements.namedItem("user") as HTMLInputElement).value.trim();
        if(user.length == 0) {
            this.setState({code: 1});
            return;
        }
        if(this.state.captcha.length == 0) {
            this.setState({code: 3});
            return;
        }
        api.recoverPassword(user, this.state.captcha, (res: any) => {
            if(res == null) {
                this.setState({code: 5});
                return;
            }
            this.setState({
                code: res["code"] as number,
                email: res["email"] as string
            });
        });
    }
}

export default withTheme(withStyles(useStyles)(Recovery));
