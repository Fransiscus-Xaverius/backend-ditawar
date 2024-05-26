export interface Environment {
    PORT: string | undefined;
    PRIVATE_KEY: string | undefined;
    SALTROUNDS: string | undefined;
    COMPANY_MAIL_SERVICE: string | undefined;
    COMPANY_MAIL: string | undefined;
    COMPANY_MAIL_PASSWORD: string | undefined;
    XENDIT_AUTH_TOKEN: string | undefined;
    MONGODB_URI: string | undefined;
}