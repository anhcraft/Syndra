import React, {ComponentProps} from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {Theme} from '@material-ui/core/styles';
import {
    createStyles,
    createTheme,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    withStyles,
    withTheme
} from "@material-ui/core";
import api from "../api";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { ThemeProvider } from '@material-ui/core';
import { Select } from '@material-ui/core';
import {green, red} from "@material-ui/core/colors";
import Sidebar from "../components/Sidebar";
import {CardStatus} from "../CardStatus";
import ReactDOM from "react-dom";
import {Transaction} from "../Transaction";

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
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        marginTop: theme.spacing(5)
    }
}));

interface DonationRank {
    user: string;
    sum: number;
}

interface IState {
    server: string;
    cardSeri: string;
    cardCode: string;
    provider: string;
    amount: number;
    code: number;
    cardStatus: CardStatus[];
    servers: Map<string, string>;
    transactions: Transaction[];
}

class Donate extends React.Component<ComponentProps<any>, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            transactions: [],
            server: "",
            cardSeri: "",
            cardCode: "",
            provider: "",
            amount: 0,
            code: -1,
            cardStatus: [],
            servers: new Map<string, string>()
        };
    }

    componentDidMount() {
        api.getCardStatus((res: CardStatus[]) => {
            if(res == null) return;
            this.setState({
                cardStatus: res
            });
        });

        api.getServerList((res: any) => {
            if(res == null) return;
            let map = new Map<string, string>();
            for (const [key, value] of Object.entries(res)) {
                map.set(key, value as string);
            }
            this.setState({
                servers: map
            });
        });

        api.getTransactions((res: Transaction[]) => {
            this.setState({
                transactions: res
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
                            <Grid xs={8} item>
                                <ThemeProvider theme={lightTheme}>
                                    <Paper className={classes.paper}>
                                        <Typography component="h1" variant="h5">Nạp thẻ</Typography>
                                        <form className={classes.form} onSubmit={this.handleSubmit.bind(this)} noValidate>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel>Máy chủ</InputLabel>
                                                <Select
                                                    labelId="server"
                                                    id="server"
                                                    value={this.state.server}
                                                    onChange={this.handleServerChange.bind(this)}
                                                >
                                                    {Array.from(this.state.servers.keys()).map((id: string) => (
                                                        <MenuItem value={id}>{this.state.servers.get(id)}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <TextField
                                                variant="outlined"
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="cardSeri"
                                                label="Seri thẻ"
                                                type="text"
                                                id="cardSeri"
                                            />
                                            <TextField
                                                variant="outlined"
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="cardCode"
                                                label="Mã thẻ"
                                                type="text"
                                                id="cardCode"
                                            />
                                            <FormControl className={classes.formControl}>
                                                <InputLabel>Mệnh giá</InputLabel>
                                                <Select
                                                    labelId="amount"
                                                    id="amount"
                                                    value={this.state.amount}
                                                    onChange={this.handleAmountChange.bind(this)}
                                                >
                                                    {[1, 2, 3, 5, 10, 20, 30, 50, 100, 200].map((v, i) => {
                                                        return <MenuItem value={v * 10000}>{v * 10000}</MenuItem>
                                                    })}
                                                </Select>
                                            </FormControl>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel>Loại thẻ</InputLabel>
                                                <Select
                                                    labelId="provider"
                                                    id="provider"
                                                    value={this.state.provider}
                                                    onChange={this.handleProviderChange.bind(this)}
                                                >
                                                    {this.state.cardStatus.map((card: CardStatus) => (
                                                        <MenuItem value={card.name}>{card.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Typography>
                                                {this.state.code == 0 && "Nạp thẻ thành công. Đang xử lý....."}
                                                {this.state.code == 1 && "Vui lòng điền đầy đủ thông tin!"}
                                                {this.state.code == 2 && "Xác minh captcha thất bại! Xin hãy thử reload lại trang web."}
                                                {this.state.code == 3 && "Không thể kết nối đến máy chủ này. Vui lòng liện hệ admin."}
                                                {this.state.code == 4 && "Loại thẻ này đang tạm ngưng. Liên hệ admin để nhận trợ giúp."}
                                                {this.state.code == 5 && "Sai mệnh giá thẻ. Vui lòng nhập lại chính xác."}
                                                {this.state.code == 6 && "Lỗi xử lý từ máy chủ. Vui lòng báo lại admin!"}
                                            </Typography>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                className={classes.submit}
                                            >
                                                Nạp thẻ
                                            </Button>
                                        </form>
                                    </Paper>
                                    <Paper className={classes.paper}>
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Tài khoản</TableCell>
                                                        <TableCell>Máy chủ</TableCell>
                                                        <TableCell>Seri</TableCell>
                                                        <TableCell>Mệnh giá</TableCell>
                                                        <TableCell>Loại thẻ</TableCell>
                                                        <TableCell>Tình trạng</TableCell>
                                                        <TableCell>Thời gian</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {this.state.transactions.map((t: Transaction) => (
                                                        <TableRow>
                                                            <TableCell component="th" scope="row">
                                                                {t.user}
                                                            </TableCell>
                                                            <TableCell component="th" scope="row">
                                                                {t.server}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {t.serial}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {t.amount}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {t.type}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {t.status == 1 && "Thẻ đúng"}
                                                                {t.status == 2 && "Sai mệnh giá"}
                                                                {t.status == 3 && "Thẻ sai"}
                                                                {t.status == 99 && "Đang xử lí"}
                                                                {t.status == 100 && "Không hợp lệ"}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {t.date}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </ThemeProvider>
                            </Grid>
                            <Grid item>
                                <ThemeProvider theme={lightTheme}>
                                    <Paper className={classes.paper}>
                                        <Typography component="h5" variant="h5">Chú ý</Typography>
                                        <ul>
                                            <li>Nhập đúng mọi thông tin!</li>
                                            <li>Chọn sai mệnh giá, phạt 50% số xu</li>
                                            <li>Không chịu trách nhiệm nếu nhập sai seri, mã thẻ</li>
                                            <li>Không chịu trách nhiệm nếu chọn sai loại thẻ</li>
                                            <li>Không chịu trách nhiệm nếu chọn sai máy chủ</li>
                                        </ul>
                                    </Paper>
                                    <Paper className={classes.paper}>
                                        <TableContainer component={Paper}>
                                            <Table className={classes.table} aria-label="simple table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Nhà mạng</TableCell>
                                                        <TableCell align="right">Tình trạng</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {this.state.cardStatus.map((card: CardStatus) => (
                                                        <TableRow key={card.name}>
                                                            <TableCell component="th" scope="row">
                                                                {card.name} {card.bonus > 0 && `[Khuyến mại ${card.bonus}%]`}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {card.enabled && (<span style={{
                                                                    verticalAlign: 'middle',
                                                                    display: 'inline-flex'
                                                                }}><CheckCircleIcon style={{ color: green[500] }}/></span>)}
                                                                {!card.enabled && (<span style={{
                                                                    verticalAlign: 'middle',
                                                                    display: 'inline-flex'
                                                                }}><CancelIcon style={{ color: red[500] }}/></span>)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </ThemeProvider>
                            </Grid>
                        </Grid>
                    </main>
                </div>
            </ThemeProvider>
        );
    }

    handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        const form = event.target as HTMLFormElement;
        const cardSeri = (form.elements.namedItem("cardSeri") as HTMLInputElement).value;
        const cardCode = (form.elements.namedItem("cardCode") as HTMLInputElement).value;
        const server = this.state.server;
        const provider = this.state.provider;
        const amount = this.state.amount;
        if(cardSeri.length == 0 || cardCode.length == 0 || server.length == 0 || provider.length == 0 || amount == 0) {
            this.setState({code: 1});
            return;
        }
        api.sendCard({
            serial: cardSeri,
            code: cardCode,
            server: server,
            provider: provider,
            amount: amount
        }, (res: any) => {
            if(res == null) {
                this.setState({code: 6});
                return;
            }
            if(res["code"] as number == 0) {
                this.setState({code: 0});
                setTimeout(function () {
                    window.location.reload(true);
                }, 4000);
            } else {
                this.setState({
                    code: res["code"] as number
                });
            }
        });
    }

    handleServerChange(event: React.ChangeEvent<any>) {
        if(this.state.server == event.target["value"]) return;
        this.setState({
            server: event.target["value"]
        })
    }

    handleAmountChange(event: React.ChangeEvent<any>) {
        if(this.state.amount == parseInt(event.target["value"])) return;
        this.setState({
            amount: parseInt(event.target["value"])
        })
    }

    handleProviderChange(event: React.ChangeEvent<any>) {
        if(this.state.provider == event.target["value"]) return;
        this.setState({
            provider: event.target["value"]
        })
    }
}

export default withTheme(withStyles(useStyles)(Donate));
