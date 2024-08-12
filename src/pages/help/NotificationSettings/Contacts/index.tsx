import React, { useState, useEffect } from 'react';
import { Table, Switch, Space, Button, Popconfirm, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import DocumentDrawer from '@/components/DocumentDrawer';
import { getNotifyContacts, putNotifyContacts } from '../services';
import { ContactType } from '../types';
import AddModal from './AddModal';
import EditModal from './EditModal';

export default function Channels() {
  const { t, i18n } = useTranslation('notificationSettings');
  const [data, setData] = useState<ContactType[]>([]);

  useEffect(() => {
    getNotifyContacts().then((res) => {
      setData(res);
    });
  }, []);

  return (
    <div className='channels-container'>
      <Table<ContactType>
        rowKey='ident'
        size='small'
        tableLayout='fixed'
        pagination={false}
        footer={() => {
          return (
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  AddModal({
                    idents: data.map((item) => item.ident),
                    onOk: (values) => {
                      const newData = [...data, values];
                      putNotifyContacts(newData).then(() => {
                        setData(newData);
                        message.success(t('common:success.add'));
                      });
                    },
                  });
                }}
              >
                {t('channels.add')}
              </Button>
              <a
                style={{ fontSize: 12 }}
                onClick={() => {
                  DocumentDrawer({
                    language: i18n.language,
                    title: t('common:document_link'),
                    type: 'iframe',
                    documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/notification_set/-connect',
                  });
                }}
              >
                {t('common:document_link')}
              </a>
            </Space>
          );
        }}
        dataSource={data}
        columns={[
          {
            title: t('channels.name'),
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: t('channels.ident'),
            dataIndex: 'ident',
            key: 'ident',
          },
          {
            title: t('channels.enabled'),
            dataIndex: 'hide',
            key: 'hide',
            render: (val: boolean, record) => {
              return (
                <Switch
                  checked={!val}
                  onChange={(checked) => {
                    const newData = _.map(data, (item) => {
                      if (item.ident === record.ident) {
                        return {
                          ...item,
                          hide: !checked,
                        };
                      }
                      return item;
                    });
                    putNotifyContacts(newData).then(() => {
                      setData(newData);
                      message.success(t('common:success.modify'));
                    });
                  }}
                />
              );
            },
          },
          {
            title: t('common:table.operations'),
            width: 100,
            render: (reocrd) => {
              return (
                <Space>
                  <a
                    onClick={() => {
                      EditModal({
                        initialValues: reocrd,
                        onOk: (values) => {
                          const oldIndex = _.findIndex(data, (item) => item.ident === reocrd.ident);
                          const newData = _.map(data, (item, idx) => {
                            if (idx === oldIndex) {
                              return values;
                            }
                            return item;
                          });
                          putNotifyContacts(newData).then(() => {
                            setData(newData);
                            message.success(t('common:success.edit'));
                          });
                        },
                      });
                    }}
                  >
                    {t('common:btn.edit')}
                  </a>
                  {!reocrd.built_in && (
                    <Popconfirm
                      title={t('common:confirm.delete')}
                      onConfirm={() => {
                        const newData = _.filter(data, (item) => item.ident !== reocrd.ident);
                        putNotifyContacts(newData).then(() => {
                          setData(newData);
                          message.success(t('common:success.delete'));
                        });
                      }}
                    >
                      <a>{t('common:btn.delete')}</a>
                    </Popconfirm>
                  )}
                </Space>
              );
            },
          },
        ]}
      ></Table>
    </div>
  );
}
