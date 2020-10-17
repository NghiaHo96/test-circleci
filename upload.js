const FtpClient = require("ftp");
const glob = require("glob");
const fs = require("fs");

const basePath = "./build"; //Thư mục chứa code đã export mặc định của nextjs

const destinationPath = ""; //Thư mục chúng ta muốn bỏ code vào trên server
const config = {
//Sử dụng biến môi trường để đảm bảo an toàn nhé! Chúng ta sẽ set biến sau.
    host: 'ftp.khanhngoc.cf',
    password: ',O3*)]5sx#a&',
    user: 'testcircleci@khanhngo.cf',
};

const ftpClient = new FtpClient(); //Khởi tạo một object của class FtpClient

function createDirectory(destination) { //hàm này để tạo đường dẫn trên host
    return ftpClient.mkdir(destination, true, (error) => {
        if (error) throw error;

        ftpClient.end();
    });
}

function uploadFile(file, destination) { //hàm này để upload file lên host
    ftpClient.put(file, destination, (error) => {
        if (error) throw error;

        console.log(`${file} => ${destination}`);
        ftpClient.end(); //nhớ đóng kết nối lại khi hoàn tất ha
    });
}

function handlePath(path) { 
    const relativeFile = path.replace(basePath, ""); //tạo đường dẫn động( bỏ tên thư mục base vì ta đang đọc file trên máy )
    const destination = `${destinationPath}${relativeFile}`; //nối với thư mục đích trên host ra đường dẫn chúng ta mong muốn trên host

    if (fs.lstatSync(path).isDirectory()) { // kiểm tra nếu là thư mục thì phải tạo thư mục
        return createDirectory(destination);
    }

    return uploadFile(path, destination); // còn nếu không phải thư mục thì upload file lên
}

ftpClient.on("ready", () => { //event ready được kích hoạt khi ta kết nối ftp thành công
    glob.sync(`${basePath}/**/*`).forEach(handlePath); // lần lượt duyệt qua từng file và xử lí file hoặc thư mục đó
});

ftpClient.connect(config); //đây là nơi mọi dòng code được bắt đầu chạy - khởi tạo kết nối tới server
