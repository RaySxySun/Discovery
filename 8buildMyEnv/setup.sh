#!/bin/bash
#source ./setup.cfg
star="********************"
readonly src_path=/home/ohraymaster/sources
readonly source_dir=/usr/local/src
readonly root_user=ohraymaster
readonly fun="$1"
cus_echo()
{
    echo ""
    printf "\n%s %s %s\n" "${star}" "${1}" "${star}"
}
err_exit()
{
    exit_code=$?
    [[ "${exit_code}" -ne 0 ]] && echo "Error with exit code: ${exit_code}" && exit 1
}
setup_root_user(){
    cus_echo "setup root user"
    usermod -g root $root_user
    groups $root_user
    cus_echo "setup root user"
}

install_apr()
{
    cus_echo "Install apr..."
    cd "${source_dir}"

    gzip -d "${src_path}"/apache/apr-1.5.2.tar.gz
    tar -xf "${src_path}"/apache/apr-1.5.2.tar
    cd apr-1.5.2/

    sudo ./configure --prefix=/usr/local/apr && \
    sudo make && \
    sudo make install
    err_exit
}

install_apr_util()
{
    cus_echo "Install apr-util..."
    cd "${source_dir}"

    gzip -d "${src_path}"/apache/apr-util-1.5.4.tar.gz
    tar -xf "${src_path}"/apache/apr-util-1.5.4.tar
    cd apr-util-1.5.4/

    sudo ./configure --prefix=/usr/local/apr-util --with-apr=/usr/local/apr/ && \
    sudo make && \
    sudo make install
    err_exit
}

install_pcre()
{
    cus_echo "Install pcre..."
    cd "${source_dir}"

    gzip -d "${src_path}"/apache/pcre-8.38.tar.gz
    tar -xf "${src_path}"/apache/pcre-8.38.tar
    cd pcre-8.38/

    sudo ./configure --prefix=/usr/local/pcre && \
    sudo make && \
    sudo make install
    err_exit
}

install_apache()
{
#    install_apr

#    install_apr_util

#    install_pcre

    cus_echo "Install httpd..."
    cd "${source_dir}"
    gzip -d "${src_path}"/apache/httpd-2.4.17.tar
    tar -xvf "${src_path}"/apache/httpd-2.4.17.tar

    gzip -d "${src_path}"/apache/httpd-2.4.17.tar.gz
    tar -xvf "${src_path}"/apache/httpd-2.4.17.tar

    cd httpd-2.4.17

    sudo ./configure --prefix=/usr/local/apache2.4.17 --enable-module=so --enable-module=rewrite --enable-rewrite --enable-ssl  \
         --with-apr=/usr/local/apr/ --with-apr-util=/usr/local/apr-util/ --with-pcre=/usr/local/pcre --with-mpm=prefork && \
    sudo make && \
    sudo make install
    err_exit

    # update config file
#    mv /usr/local/apache2.4.16/conf /usr/local/apache2.4.16/conf-b
#    cp -r "${src_path}"/apache/conf /usr/local/apache2.4.16/
#    sudo mkdir /home/ohraymaster/www
#    sudo chown ray:staff /home/ohraymaster/www

    # startup apache
    /usr/local/apache2.4.17/bin/apachectl start
    curl localhost
}

__main()
{
    if [[ "${fun}" == "All" ]]; then
        setup_root_user
        install_apachel
    else
        ${fun}
    fi
}

__main