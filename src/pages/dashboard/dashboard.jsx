import { Card, Col, Row, theme } from 'antd';
import { TrendingUp } from 'lucide-react';
import {
  BookMarked,
  ChartSpline,
  ChevronRight,
  CircleDollarSign,
  File,
} from 'lucide-react';
import { Link } from 'react-router';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const { useToken } = theme;

const stats = [
  {
    id: 1,
    name: 'Income',
    value: '875000000',
    prevValue: '8923.11',
    changeType: 'increase',
    precision: 2,
    prefix: '$',
    detailsLink: '/customers',
  },
  {
    id: 2,
    name: 'Expenses',
    value: '625000000',
    prevValue: '8654.33',
    changeType: 'decrease',
    precision: 2,
    prefix: '$',
    detailsLink: '/customers',
  },
  {
    id: 3,
    name: 'Net Profit',
    value: '250000000',
    prevValue: '3812.89',
    changeType: 'decrease',
    precision: 2,
    prefix: '$',
    detailsLink: '/customers',
  },
  {
    id: 4,
    name: 'Customers',
    value: '2350',
    prevValue: '2123',
    changeType: 'increase',
    precision: 0,
    prefix: '',
    detailsLink: '/customers',
  },
];

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const Dashboard = () => {
  const { token } = useToken();

  return (
    <div>
      <Row
        gutter={[
          {
            xs: token.size,
            sm: token.size,
            md: token.size,
            lg: token.sizeLG,
            xl: token.sizeLG,
          },
          token.size,
        ]}
      >
        {stats.map((stat) => (
          <Col key={stat.id} xs={24} sm={24} md={12} lg={6} xl={6}>
            <Card>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={20} className="text-emerald-500" />
                  <h3 className="font-medium text-gray-500">{stat.name}</h3>
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                  +2.5%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-4">
                Rp{' '}
                {Number(stat.value).toLocaleString('id-ID', {
                  minimumFractionDigits: 2,
                })}
              </p>
              <Link
                to={stat.detailsLink}
                className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View details
                <ChevronRight size={16} />
              </Link>
            </Card>
          </Col>
        ))}

        <Col xs={24} sm={24} md={12} lg={18} xl={18}>
          <Card title="Sales Overview" className="h-full">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={token.colorPrimary}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={token.colorPrimary}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={token.colorSuccess}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={token.colorSuccess}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} width={60} />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={token.colorBorderSecondary}
                />
                <Tooltip
                  contentStyle={{
                    background: token.colorBgElevated,
                    border: `1px solid ${token.colorBorder}`,
                    borderRadius: token.borderRadius,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="uv"
                  stroke={token.colorPrimary}
                  fillOpacity={1}
                  fill="url(#colorUv)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="pv"
                  stroke={token.colorSuccess}
                  fillOpacity={1}
                  fill="url(#colorPv)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12} lg={6} xl={6}>
          <Card title="Balance Sheet" className="h-full">
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-6 rounded-lg mb-4">
              <div className="flex items-center mb-4">
                <BookMarked size={20} className="mr-3 text-sky-500" />
                <p className="font-medium text-sky-600">Asset</p>
              </div>
              <p className="text-2xl font-bold text-sky-600">
                Rp.{' '}
                {Number(1250000000).toLocaleString('id-ID', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg mb-4">
              <div className="flex items-center mb-4">
                <File size={20} className="mr-3 text-amber-500" />
                <p className="font-medium text-amber-500">Liabilities</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                Rp.{' '}
                {Number(450000000).toLocaleString('id-ID', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg mb-4">
              <div className="flex items-center mb-4">
                <ChartSpline size={20} className="mr-3 text-purple-500" />
                <p className="font-medium text-purple-500">Equity</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                Rp.{' '}
                {Number(800000000).toLocaleString('id-ID', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card title="Recent Transactions" className="h-full">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                  <CircleDollarSign size={24} className="text-green-500" />
                  <div>
                    <p className="text-gray-700">Payment Received</p>
                    <p className="text-sm text-gray-500">Toko Ratu Gombong</p>
                  </div>
                </div>
                <p className="text-green-500 font-bold">
                  Rp{' '}
                  {Number(2500000).toLocaleString('id-ID', {
                    minimumFractionDigits: 0,
                  })}
                </p>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                  <CircleDollarSign size={24} className="text-green-500" />
                  <div>
                    <p className="text-gray-700">Payment Received</p>
                    <p className="text-sm text-gray-500">Umar Malufi</p>
                  </div>
                </div>
                <p className="text-green-500 font-bold">
                  Rp{' '}
                  {Number(1750000).toLocaleString('id-ID', {
                    minimumFractionDigits: 0,
                  })}
                </p>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                  <CircleDollarSign size={24} className="text-green-500" />
                  <div>
                    <p className="text-gray-700">Payment Received</p>
                    <p className="text-sm text-gray-500">Royhan Rahim</p>
                  </div>
                </div>
                <p className="text-green-500 font-bold">
                  Rp{' '}
                  {Number(3250000).toLocaleString('id-ID', {
                    minimumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
