import SelectWithReactQuery from '@/components/SelectWithReactQuery';
import { fetchSelect } from '@/utils/services/fetchSelect';
import { ProForm } from '@ant-design/pro-components';
import { Checkbox, Col, DatePicker, Modal, Row, Typography } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function FilterReportProfitLoss() {
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isLoading },
  } = useForm({
    defaultValues: {
      dateRange: null,
      currency: null,
      classification: null,
      displayDetail: false,
      displayAccountCode: false,
      displayZeroBalance: false,
    },
  });

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  const onSubmit = (data) => {
    // Process filter data here
    const filterParams = {};

    if (data.dateRange && data.dateRange.length === 2) {
      filterParams['date[from]'] = data.dateRange[0].format('YYYY-MM-DD');
      filterParams['date[to]'] = data.dateRange[1].format('YYYY-MM-DD');
    }

    if (data.currency) {
      filterParams['currency[id]'] = data.currency.value;
    }

    if (data.classification) {
      filterParams['classification[id]'] = data.classification.value;
    }
    filterParams.display_detail = data.displayDetail;
    filterParams.display_account_code = data.displayAccountCode;
    filterParams.display_zero_balance = data.displayZeroBalance;

    const queryParams = new URLSearchParams(filterParams).toString();
    navigate(`/reports/financial-statement/report-profit-loss?${queryParams}`, {
      replace: true,
    });
  };

  return (
    <Modal open={true} onCancel={handleClose} footer={null} width={600}>
      <Title level={3}>{'Filter Profit & Loss Report'}</Title>

      <ProForm
        disabled={isLoading || isSubmitting}
        onFinish={handleSubmit(onSubmit)}
        onReset={() => navigate(-1)}
        submitter={{
          submitButtonProps: {
            disabled: isLoading || isSubmitting,
            loading: isLoading || isSubmitting,
          },
          searchConfig: {
            submitText: 'Apply Filter',
            resetText: 'Close',
          },
        }}
      >
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24}>
            <Controller
              name="dateRange"
              control={control}
              render={({ field }) => (
                <div>
                  <Text strong className="block mb-2">
                    Date Range
                  </Text>
                  <RangePicker
                    {...field}
                    style={{ width: '100%' }}
                    placeholder={['Start Date', 'End Date']}
                    format="YYYY-MM-DD"
                  />
                </div>
              )}
            />
          </Col>

          <Col xs={24}>
            <Controller
              name="currency"
              control={control}
              render={(form) => (
                <div>
                  <Text strong className="block mb-2">
                    Currency
                  </Text>
                  <SelectWithReactQuery
                    {...form.field}
                    url="/api/v2/currencies"
                    queryKey={['currency', '']}
                    placeholder="Select currency"
                    customFetcher={fetchSelect}
                    labelKey="symbol"
                    valueKey="id"
                  />
                </div>
              )}
            />
          </Col>

          <Col xs={24}>
            <Controller
              name="classification"
              control={control}
              render={(form) => (
                <div>
                  <Text strong className="block mb-2">
                    Classification
                  </Text>
                  <SelectWithReactQuery
                    {...form.field}
                    url="/api/v2/contact_classifications"
                    queryKey={['classification', '']}
                    placeholder="Select classification"
                    customFetcher={fetchSelect}
                    labelKey="name"
                    valueKey="id"
                  />
                </div>
              )}
            />
          </Col>

          <Col xs={24}>
            <div className="space-y-3">
              <Controller
                name="displayDetail"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    Display Detail
                  </Checkbox>
                )}
              />

              <Controller
                name="displayAccountCode"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    Display Account Code
                  </Checkbox>
                )}
              />

              <Controller
                name="displayZeroBalance"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    Display Zero Balance
                  </Checkbox>
                )}
              />
            </div>
          </Col>
        </Row>
      </ProForm>
    </Modal>
  );
}
