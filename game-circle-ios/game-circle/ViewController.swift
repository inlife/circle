//
//  ViewController.swift
//  game-circle
//
//  Created by Inlife on 12/1/15.
//  Copyright (c) 2015 Inlife. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    @IBOutlet var webView: UIWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        let requestURL = NSBundle.mainBundle().URLForResource("index", withExtension:"html")
        let request = NSURLRequest(URL: requestURL!)
        webView.scrollView.bounces = false;
        webView.loadRequest(request)
    }
    
    override func prefersStatusBarHidden() -> Bool {
        return true
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

