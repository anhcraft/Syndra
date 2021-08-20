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
import Login from "./Login";
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
}

class SignUp extends React.Component<ComponentProps<any>, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            online: 0,
            code: -1,
            captcha: ""
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
                <Grid container>
                    <Grid item xs>
                        <Paper className={classes.paper}>
                            <Avatar className={classes.avatar}>
                                <LockOutlinedIcon fontSize="large" />
                            </Avatar>
                            <Typography component="h1" variant="h5">Đăng ký MineHot</Typography>
                            <form className={classes.form} onSubmit={this.handleSubmit.bind(this)} noValidate>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="user"
                                    label="Tài khoản (3-16 kí tự, chỉ chứa chữ, số và _)"
                                    name="user"
                                    autoFocus
                                    error={this.state.code == 1 || this.state.code == 4}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="pass"
                                    label="Mật khẩu (8-30 kí tự)"
                                    type="password"
                                    id="pass"
                                    error={this.state.code == 2}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="email"
                                    label="Email (Nhập đúng để lấy lại mật khẩu khi cần)"
                                    type="email"
                                    id="email"
                                    error={this.state.code == 3}
                                />
                                <ReCAPTCHA
                                    sitekey="6LcSvAscAAAAAP9KKw1zKFWt12devap5KnuRGJeD"
                                    hl="vi"
                                    onChange={this.verifyCaptcha.bind(this)}
                                />
                                <Typography>
                                    {this.state.code == 0 && "Tạo tài khoản thành công!"}
                                    {this.state.code == 1 && "Tên tài khoản không phù hợp! 3-16 kí tự, chỉ chứa chữ, số và _"}
                                    {this.state.code == 2 && "Mật khẩu quá ngắn hoặc quá dài!"}
                                    {this.state.code == 3 && "Email không hợp lệ!"}
                                    {this.state.code == 4 && "Tài khoản này đã tồn tại. Vui lòng đăng nhập!"}
                                    {this.state.code == 5 && "Lỗi xử lý từ máy chủ. Vui lòng báo lại admin!"}
                                    {this.state.code == 6 && "Vui lòng xác minh captcha!"}
                                    {this.state.code == 7 && "Xác minh captcha thất bại!"}
                                    {this.state.code == 8 && "Email đã có người sử dụng!"}
                                </Typography>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}
                                >
                                    Đăng ký
                                </Button>
                                <Grid container>
                                    <Grid item xs/>
                                    <Grid item>
                                        <Link href="#" variant="body2" onClick={this.openLogin}>
                                            {"Đã có tài khoản?"}
                                        </Link>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </Grid>
                    <Grid item>
                        <Paper className={classes.paper}>
                            <ul>
                                <li>Sử dụng Gmail thật đề phòng quên mật khẩu có thể lấy lại</li>
                                <li>Không đặt các mật khẩu dễ như “123456” tránh bị mất tài khoản</li>
                                <li>Nên đặt mật khẩu bao gồm chữ cái, số và ký tự đặc biệt</li>
                            </ul>
                        </Paper>
                        <Paper className={classes.paper}>
                            <b>IP Server: Minehot.com | Online: {this.state.online}</b>
                        </Paper>
                    </Grid>
                </Grid>
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
        const pass = (form.elements.namedItem("pass") as HTMLInputElement).value.trim();
        const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
        if(user.length < 3 || user.length > 16 || !(/^[A-Za-z0-9_]{3,16}$/.test(user))) {
            this.setState({code: 1});
            return;
        }
        if(pass.length < 8 || pass.length > 30) {
            this.setState({code: 2});
            return;
        }
        if(!(/^\S+@\S+$/.test(email))) {
            this.setState({code: 3});
            return;
        }
        if(this.state.captcha.length == 0) {
            this.setState({code: 6});
            return;
        }
        api.signUp({
            user: user,
            pass: pass,
            email: email,
            captcha: this.state.captcha
        }, (res: any) => {
            if(res == null) {
                this.setState({code: 5});
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

    openLogin(e: any){
        ReactDOM.render(
            <Login/>,
            document.getElementById('root')
        )
    }
}

export default withTheme(withStyles(useStyles)(SignUp));
