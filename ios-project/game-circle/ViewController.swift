//
//  ViewController.swift
//  game-circle
//
//  Created by Vladyslav Hrytsenko on 12/1/15.
//  Copyright (c) 2015 Vladyslav Hrytsenko. All rights reserved.
//

import UIKit
import WebKit

class ViewController: UIViewController {
//    override func shouldAutorotate() -> Bool {
//        return false
//    }
//
//    override func supportedInterfaceOrientations() -> Int {
//        return UIInterfaceOrientation.Portrait.rawValue
//    }

    static let webView: WKWebView = WKWebView(frame: CGRectZero);

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view, typically from a nib.
        view.addSubview(ViewController.webView)

        ViewController.webView.translatesAutoresizingMaskIntoConstraints = false;
        let height = NSLayoutConstraint(item: ViewController.webView, attribute: .Height, relatedBy: .Equal, toItem: view, attribute: .Height, multiplier: 1, constant: 0)
        let width = NSLayoutConstraint(item: ViewController.webView, attribute: .Width, relatedBy: .Equal, toItem: view, attribute: .Width, multiplier: 1, constant: 0)
        view.addConstraints([height, width])

        let requestURL = NSBundle.mainBundle().URLForResource("index", withExtension:"html")
        let request = NSURLRequest(URL: requestURL!)
        ViewController.webView.scrollView.bounces = false;
        ViewController.webView.loadRequest(request)


    }

    override func prefersStatusBarHidden() -> Bool {
        return true
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }



}

